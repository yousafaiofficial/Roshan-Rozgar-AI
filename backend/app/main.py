import os
import re
import json
import sqlite3
import hashlib
import secrets
import hmac
from datetime import datetime, timezone
from pathlib import Path
from contextlib import contextmanager
from typing import Optional
from fastapi import FastAPI, HTTPException, Header, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from dotenv import load_dotenv

BASE = Path(__file__).resolve().parent.parent
load_dotenv(BASE / '.env')
DB = BASE / 'roshan.db'
UPLOADS = BASE / 'uploads'
UPLOADS.mkdir(exist_ok=True)
SECRET = os.getenv('ROSHAN_SECRET', 'development-only-change-this-secret')
serializer = URLSafeTimedSerializer(SECRET)
app = FastAPI(title='Roshan Rozgar AI API', version='0.1.0')
frontend_origins = [origin.strip() for origin in os.getenv(
    'FRONTEND_ORIGINS',
    'http://localhost:3000,http://127.0.0.1:3000',
).split(',') if origin.strip()]
app.add_middleware(CORSMiddleware, allow_origins=frontend_origins, allow_credentials=True, allow_methods=['*'], allow_headers=['*'])

@contextmanager
def db():
    conn = sqlite3.connect(DB, timeout=20, isolation_level=None)
    conn.row_factory = sqlite3.Row
    conn.execute('PRAGMA foreign_keys=ON')
    try: yield conn
    finally: conn.close()

def init():
    with db() as c:
        c.executescript('''CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY, name TEXT NOT NULL, phone TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, salt TEXT NOT NULL, role TEXT NOT NULL, city TEXT NOT NULL, cn ic TEXT);
        '''.replace('cn ic','cnic'))
        c.executescript('''CREATE TABLE IF NOT EXISTS workers(user_id INTEGER PRIMARY KEY REFERENCES users(id), skill TEXT NOT NULL, extra_skills TEXT NOT NULL DEFAULT '[]', bio TEXT NOT NULL DEFAULT '', rate INTEGER NOT NULL DEFAULT 1000, available INTEGER NOT NULL DEFAULT 1, verified INTEGER NOT NULL DEFAULT 0, photo TEXT);
        CREATE TABLE IF NOT EXISTS jobs(id INTEGER PRIMARY KEY, customer_id INTEGER NOT NULL REFERENCES users(id), worker_id INTEGER NOT NULL REFERENCES users(id), description TEXT NOT NULL, budget INTEGER NOT NULL, scheduled_at TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending', agreed_price INTEGER, photo TEXT, created_at TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS reviews(id INTEGER PRIMARY KEY, job_id INTEGER UNIQUE NOT NULL REFERENCES jobs(id), reviewer_id INTEGER NOT NULL REFERENCES users(id), worker_id INTEGER NOT NULL REFERENCES users(id), safety INTEGER NOT NULL, quality INTEGER NOT NULL, punctuality INTEGER NOT NULL, professionalism INTEGER NOT NULL, communication INTEGER NOT NULL, comment TEXT NOT NULL DEFAULT '');
        CREATE TABLE IF NOT EXISTS notifications(id INTEGER PRIMARY KEY, phone TEXT NOT NULL, skill TEXT NOT NULL, city TEXT NOT NULL, created_at TEXT NOT NULL);''')
        worker_columns={row['name'] for row in c.execute('PRAGMA table_info(workers)').fetchall()}
        for name,definition in {
            'neighborhood':"TEXT NOT NULL DEFAULT ''",
            'experience_years':'INTEGER NOT NULL DEFAULT 0',
            'pricing_type':"TEXT NOT NULL DEFAULT 'job'",
        }.items():
            if name not in worker_columns:c.execute(f'ALTER TABLE workers ADD COLUMN {name} {definition}')
        count=c.execute('SELECT COUNT(*) FROM users').fetchone()[0]
        if not count:
            for name,phone,skill,city,rate,bio in [
                ('Ahmed Raza','03000000001','Electrician','Islamabad',1500,'Wiring, switches and safe electrical repairs.'),
                ('Bilal Khan','03000000002','Plumber','Rawalpindi',1200,'Leaks, taps and plumbing installations.'),
                ('Usman Ali','03000000003','AC Technician','Islamabad',2200,'AC servicing, cooling and maintenance.'),
                ('Hassan Malik','03000000004','Carpenter','Rawalpindi',1800,'Furniture assembly and wood repairs.'),
                ('Sajid Iqbal','03000000005','Painter','Islamabad',2000,'Interior painting and finishing.'),
                ('Farhan Akram','03000000006','Cleaner','Rawalpindi',1000,'Residential cleaning and deep cleaning.'),
                ('Nadia Perveen','03000000007','Cleaner','Islamabad',1300,'Home cleaning, kitchen care and organized deep cleaning.'),
                ('Imran Shah','03000000008','Mechanic','Rawalpindi',1800,'Motorcycle diagnostics, servicing and roadside repairs.')]:
                salt=secrets.token_hex(16)
                pw=hashlib.pbkdf2_hmac('sha256',b'Demo12345!',bytes.fromhex(salt),260000).hex()
                cur=c.execute('INSERT INTO users(name,phone,password_hash,salt,role,city) VALUES(?,?,?,?,?,?)',(name,phone,pw,salt,'worker',city))
                c.execute('INSERT INTO workers(user_id,skill,bio,rate) VALUES(?,?,?,?)',(cur.lastrowid,skill,bio,rate))
        seeded=[
            ('03000000001','Ahmed Raza','F-10',7,'job','/images/workers/ahmed-raza.png'),
            ('03000000002','Bilal Khan','Satellite Town',11,'job','/images/workers/bilal-khan.png'),
            ('03000000005','Sajida Iqbal','G-11',6,'job','/images/workers/sajida-iqbal.png'),
        ]
        for phone,name,neighborhood,years,pricing,photo in seeded:
            c.execute('UPDATE users SET name=? WHERE phone=?',(name,phone))
            c.execute('UPDATE workers SET neighborhood=?,experience_years=?,pricing_type=?,photo=? WHERE user_id=(SELECT id FROM users WHERE phone=?)',(neighborhood,years,pricing,photo,phone))
init()

class Register(BaseModel):
    name:str=Field(min_length=2,max_length=100)
    phone:str=Field(min_length=10,max_length=20)
    password:str=Field(min_length=8,max_length=128)
    role:str
    city:str=Field(min_length=2,max_length=80)
    cnic:Optional[str]=None
    skill:Optional[str]=None
    extra_skills:list[str]=[]
    bio:str=''
    rate:int=Field(default=1000,ge=0)
    neighborhood:str=Field(default='',max_length=100)
    experience_years:int=Field(default=0,ge=0,le=60)
    pricing_type:str=Field(default='job',pattern='^(job|hour)$')
class WorkerUpdate(BaseModel):
    photo:Optional[str]=None
    neighborhood:Optional[str]=Field(default=None,max_length=100)
    experience_years:Optional[int]=Field(default=None,ge=0,le=60)
    pricing_type:Optional[str]=Field(default=None,pattern='^(job|hour)$')
    bio:Optional[str]=Field(default=None,max_length=1000)
class Login(BaseModel):
    phone:str
    password:str
class JobIn(BaseModel):
    worker_id:int
    description:str=Field(min_length=8,max_length=2000)
    budget:int=Field(gt=0)
    scheduled_at:str
    photo:Optional[str]=None
class AcceptIn(BaseModel):
    agreed_price:int=Field(gt=0)
class ReviewIn(BaseModel):
    safety:int=Field(ge=1,le=5)
    quality:int=Field(ge=1,le=5)
    punctuality:int=Field(ge=1,le=5)
    professionalism:int=Field(ge=1,le=5)
    communication:int=Field(ge=1,le=5)
    comment:str=Field(default='',max_length=1000)
class NotifyIn(BaseModel):
    phone:str
    skill:str
    city:str

def auth(authorization:Optional[str]):
    if not authorization or not authorization.startswith('Bearer '): raise HTTPException(401,'Please log in')
    try: uid=serializer.loads(authorization[7:],max_age=60*60*24*7)
    except (BadSignature,SignatureExpired): raise HTTPException(401,'Session expired')
    with db() as c: user=c.execute('SELECT id,name,phone,role,city FROM users WHERE id=?',(uid,)).fetchone()
    if not user: raise HTTPException(401,'Invalid user')
    return dict(user)

def worker_dict(r):
    d=dict(r);d['extra_skills']=json.loads(d['extra_skills']);d['available']=bool(d['available']);d['verified']=bool(d['verified']);return d

@app.get('/api/health')
def health(): return {'status':'ok','app':'Roshan Rozgar AI'}
@app.post('/api/auth/register')
def register(payload:Register):
    if payload.role not in ('customer','worker'): raise HTTPException(400,'Invalid role')
    if payload.role=='worker' and not payload.skill: raise HTTPException(400,'Main skill required')
    salt=secrets.token_hex(16)
    pw=hashlib.pbkdf2_hmac('sha256',payload.password.encode(),bytes.fromhex(salt),260000).hex()
    with db() as c:
        try:
            c.execute('BEGIN IMMEDIATE')
            cur=c.execute('INSERT INTO users(name,phone,password_hash,salt,role,city,cnic) VALUES(?,?,?,?,?,?,?)',(payload.name,payload.phone,pw,salt,payload.role,payload.city,payload.cnic))
            if payload.role=='worker': c.execute('INSERT INTO workers(user_id,skill,extra_skills,bio,rate,neighborhood,experience_years,pricing_type) VALUES(?,?,?,?,?,?,?,?)',(cur.lastrowid,payload.skill,json.dumps(payload.extra_skills),payload.bio,payload.rate,payload.neighborhood,payload.experience_years,payload.pricing_type))
            c.commit()
        except sqlite3.IntegrityError:
            c.rollback();raise HTTPException(409,'Phone already registered')
    return {'token':serializer.dumps(cur.lastrowid),'user':{'id':cur.lastrowid,'name':payload.name,'role':payload.role,'city':payload.city}}
@app.post('/api/auth/login')
def login(payload:Login):
    with db() as c: u=c.execute('SELECT * FROM users WHERE phone=?',(payload.phone,)).fetchone()
    if not u: raise HTTPException(401,'Invalid credentials')
    check=hashlib.pbkdf2_hmac('sha256',payload.password.encode(),bytes.fromhex(u['salt']),260000).hex()
    if not hmac.compare_digest(check,u['password_hash']): raise HTTPException(401,'Invalid credentials')
    return {'token':serializer.dumps(u['id']),'user':{'id':u['id'],'name':u['name'],'role':u['role'],'city':u['city']}}
@app.get('/api/me')
def me(authorization:Optional[str]=Header(None)):return auth(authorization)
@app.get('/api/workers')
def workers(skill:str='',city:str='',available:bool=False):
    q='''SELECT u.id,u.name,u.city,w.skill,w.extra_skills,w.bio,w.rate,w.available,w.verified,w.photo,w.neighborhood,w.experience_years,w.pricing_type,
    (SELECT ROUND(AVG((safety+quality+punctuality+professionalism+communication)/5.0),1) FROM reviews WHERE worker_id=u.id) rating,
    (SELECT COUNT(*) FROM reviews WHERE worker_id=u.id) review_count,
    (SELECT COUNT(*) FROM jobs WHERE worker_id=u.id AND status='completed') completed_jobs,
    (SELECT ROUND(AVG(safety),1) FROM reviews WHERE worker_id=u.id) safety_rating,
    (SELECT ROUND(AVG(quality),1) FROM reviews WHERE worker_id=u.id) quality_rating,
    (SELECT ROUND(AVG(punctuality),1) FROM reviews WHERE worker_id=u.id) punctuality_rating,
    (SELECT ROUND(AVG(professionalism),1) FROM reviews WHERE worker_id=u.id) professionalism_rating,
    (SELECT ROUND(AVG(communication),1) FROM reviews WHERE worker_id=u.id) communication_rating
    FROM users u JOIN workers w ON u.id=w.user_id WHERE 1=1'''
    params=[]
    if skill: q+=' AND (LOWER(w.skill) LIKE ? OR LOWER(w.extra_skills) LIKE ?)';params += ['%'+skill.lower()+'%']*2
    if city: q+=' AND LOWER(u.city) LIKE ?';params.append('%'+city.lower()+'%')
    if available:q+=' AND w.available=1'
    q+=' ORDER BY w.available DESC,u.id LIMIT 100'
    with db() as c:return [worker_dict(x) for x in c.execute(q,params).fetchall()]
@app.get('/api/workers/{worker_id}')
def worker(worker_id:int):
    matches=[x for x in workers() if x['id']==worker_id]
    if not matches:raise HTTPException(404,'Worker not found')
    return matches[0]
@app.patch('/api/workers/me')
def update_worker(payload:WorkerUpdate,authorization:Optional[str]=Header(None)):
    user=auth(authorization)
    if user['role']!='worker':raise HTTPException(403,'Only workers can update profiles')
    changes={k:v for k,v in payload.model_dump().items() if v is not None}
    if not changes:return worker(user['id'])
    if 'photo' in changes and changes['photo'] and not (changes['photo'].startswith('/api/uploads/') or changes['photo'].startswith('/images/workers/')):raise HTTPException(400,'Invalid profile photo')
    with db() as c:
        c.execute('UPDATE workers SET '+','.join(f'{key}=?' for key in changes)+' WHERE user_id=?',[*changes.values(),user['id']])
    return worker(user['id'])
@app.post('/api/jobs')
def create_job(payload:JobIn,authorization:Optional[str]=Header(None)):
    user=auth(authorization)
    if user['role']!='customer':raise HTTPException(403,'Only customers can request jobs')
    try:datetime.fromisoformat(payload.scheduled_at.replace('Z','+00:00'))
    except ValueError:raise HTTPException(400,'Invalid scheduled time')
    with db() as c:
        w=c.execute('SELECT available FROM workers WHERE user_id=?',(payload.worker_id,)).fetchone()
        if not w:raise HTTPException(404,'Worker not found')
        if not w['available']:raise HTTPException(409,'Worker is busy')
        cur=c.execute('INSERT INTO jobs(customer_id,worker_id,description,budget,scheduled_at,photo,created_at) VALUES(?,?,?,?,?,?,?)',(user['id'],payload.worker_id,payload.description,payload.budget,payload.scheduled_at,payload.photo,datetime.now(timezone.utc).isoformat()))
    return {'id':cur.lastrowid,'status':'pending'}
@app.get('/api/jobs')
def list_jobs(authorization:Optional[str]=Header(None)):
    user=auth(authorization)
    col='worker_id' if user['role']=='worker' else 'customer_id'
    with db() as c:
        rows=c.execute(f'''SELECT j.*,u.name AS worker_name,cu.name AS customer_name FROM jobs j JOIN users u ON j.worker_id=u.id JOIN users cu ON j.customer_id=cu.id WHERE j.{col}=? ORDER BY j.id DESC''',(user['id'],)).fetchall()
    return [dict(x) for x in rows]
@app.post('/api/jobs/{job_id}/accept')
def accept(job_id:int,payload:AcceptIn,authorization:Optional[str]=Header(None)):
    user=auth(authorization)
    if user['role']!='worker':raise HTTPException(403,'Only workers can accept jobs')
    with db() as c:
        c.execute('BEGIN IMMEDIATE')
        job=c.execute('SELECT * FROM jobs WHERE id=? AND worker_id=?',(job_id,user['id'])).fetchone()
        if not job or job['status']!='pending':c.rollback();raise HTTPException(409,'Job unavailable')
        busy=c.execute('UPDATE workers SET available=0 WHERE user_id=? AND available=1',(user['id'],))
        if busy.rowcount!=1:c.rollback();raise HTTPException(409,'Worker already booked')
        c.execute("UPDATE jobs SET status='accepted',agreed_price=? WHERE id=?",(payload.agreed_price,job_id))
        c.execute("UPDATE jobs SET status='declined' WHERE worker_id=? AND id!=? AND status='pending'",(user['id'],job_id))
        c.commit()
    return {'status':'accepted','agreed_price':payload.agreed_price}
@app.post('/api/jobs/{job_id}/decline')
def decline(job_id:int,authorization:Optional[str]=Header(None)):
    user=auth(authorization)
    with db() as c:
        res=c.execute("UPDATE jobs SET status='declined' WHERE id=? AND worker_id=? AND status='pending'",(job_id,user['id']))
    if not res.rowcount:raise HTTPException(409,'Job unavailable')
    return {'status':'declined'}
@app.post('/api/jobs/{job_id}/complete')
def complete(job_id:int,authorization:Optional[str]=Header(None)):
    user=auth(authorization)
    with db() as c:
        c.execute('BEGIN IMMEDIATE')
        job=c.execute('SELECT * FROM jobs WHERE id=?',(job_id,)).fetchone()
        if not job or job['status']!='accepted' or user['id'] not in (job['customer_id'],job['worker_id']):c.rollback();raise HTTPException(409,'Job unavailable')
        c.execute("UPDATE jobs SET status='completed' WHERE id=?",(job_id,))
        c.execute('UPDATE workers SET available=1 WHERE user_id=?',(job['worker_id'],))
        c.commit()
    return {'status':'completed'}
@app.post('/api/jobs/{job_id}/review')
def review(job_id:int,payload:ReviewIn,authorization:Optional[str]=Header(None)):
    user=auth(authorization)
    with db() as c:
        job=c.execute('SELECT * FROM jobs WHERE id=?',(job_id,)).fetchone()
        if not job or job['status']!='completed' or job['customer_id']!=user['id']:raise HTTPException(403,'Only customer can review completed job')
        try:c.execute('INSERT INTO reviews(job_id,reviewer_id,worker_id,safety,quality,punctuality,professionalism,communication,comment) VALUES(?,?,?,?,?,?,?,?,?)',(job_id,user['id'],job['worker_id'],payload.safety,payload.quality,payload.punctuality,payload.professionalism,payload.communication,payload.comment))
        except sqlite3.IntegrityError:raise HTTPException(409,'Already reviewed')
    return {'status':'saved'}
@app.post('/api/notify')
def notify(payload:NotifyIn):
    with db() as c:c.execute('INSERT INTO notifications(phone,skill,city,created_at) VALUES(?,?,?,?)',(payload.phone,payload.skill,payload.city,datetime.now(timezone.utc).isoformat()))
    return {'status':'saved','note':'Availability request saved; SMS delivery is not connected'}
@app.post('/api/uploads')
async def upload(file:UploadFile=File(...),authorization:Optional[str]=Header(None)):
    auth(authorization)
    allowed={'image/jpeg':'.jpg','image/png':'.png','image/webp':'.webp'}
    if file.content_type not in allowed:raise HTTPException(400,'Only JPG, PNG and WEBP images supported')
    data=await file.read(5*1024*1024+1)
    if len(data)>5*1024*1024:raise HTTPException(413,'Image exceeds 5 MB')
    signatures={'image/jpeg':(b'\xff\xd8\xff',),'image/png':(b'\x89PNG\r\n\x1a\n',),'image/webp':(b'RIFF',)}
    if not any(data.startswith(signature) for signature in signatures[file.content_type]):raise HTTPException(400,'Image content does not match its file type')
    if file.content_type=='image/webp' and (len(data)<12 or data[8:12]!=b'WEBP'):raise HTTPException(400,'Invalid WEBP image')
    name=secrets.token_hex(16)+allowed[file.content_type]
    (UPLOADS/name).write_bytes(data)
    return {'url':'/api/uploads/'+name}
@app.get('/api/uploads/{name}')
def uploaded(name:str):
    if not re.fullmatch(r'[a-f0-9]{32}\.(jpg|png|webp)',name):raise HTTPException(404)
    file=UPLOADS/name
    if not file.exists():raise HTTPException(404)
    return FileResponse(file)
