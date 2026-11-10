import os
import re
import json
import sqlite3
import hashlib
import secrets
import hmac
import base64
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path
from contextlib import contextmanager
from typing import Optional
from fastapi import FastAPI, HTTPException, Header, UploadFile, File, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field, field_validator
from dotenv import load_dotenv

BASE = Path(__file__).resolve().parent.parent
load_dotenv(BASE / '.env')
DB = Path(os.getenv('ROSHAN_DB') or BASE / 'roshan.db')
UPLOADS = BASE / 'uploads'
UPLOADS.mkdir(exist_ok=True)
SESSION_TTL_SECONDS = 60 * 60 * 24 * 7
RESET_TTL_SECONDS = 60 * 15
PASSWORD_ITERATIONS = 260000
DUMMY_PASSWORD_HASH = hashlib.pbkdf2_hmac('sha256',bytes(32),bytes(16),PASSWORD_ITERATIONS).hex()
app = FastAPI(title='Roshan Rozgar AI API', version='0.1.0')
frontend_origins = [origin.strip() for origin in os.getenv(
    'FRONTEND_ORIGINS',
    'http://localhost:3000,http://127.0.0.1:3000',
).split(',') if origin.strip()]
app.add_middleware(CORSMiddleware, allow_origins=frontend_origins, allow_credentials=True, allow_methods=['*'], allow_headers=['*'])

@app.middleware('http')
async def cookie_session_auth(request:Request,call_next):
    session_token=request.cookies.get('roshan_session')
    authorization=request.headers.get('authorization')
    if session_token and not authorization:
        now=int(datetime.now(timezone.utc).timestamp())
        with db() as c:
            session=c.execute('SELECT csrf_hash FROM sessions WHERE token_hash=? AND revoked_at IS NULL AND expires_at>?',(hash_token(session_token),now)).fetchone()
        if session and request.method in ('POST','PUT','PATCH','DELETE'):
            csrf_cookie=request.cookies.get('roshan_csrf','')
            csrf_header=request.headers.get('x-csrf-token','')
            if not csrf_cookie or not hmac.compare_digest(csrf_cookie,csrf_header) or not session['csrf_hash'] or not hmac.compare_digest(hash_token(csrf_header),session['csrf_hash']):
                return JSONResponse(status_code=403,content={'detail':'CSRF validation failed.'})
        if b'authorization' not in dict(request.scope['headers']):
            request.scope['headers'].append((b'authorization',f'Bearer {session_token}'.encode()))
    return await call_next(request)

@contextmanager
def db():
    conn = sqlite3.connect(DB, timeout=20, isolation_level=None)
    conn.row_factory = sqlite3.Row
    conn.execute('PRAGMA foreign_keys=ON')
    try: yield conn
    finally: conn.close()

def init():
    with db() as c:
        c.execute('''CREATE TABLE IF NOT EXISTS users(
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            phone TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            salt TEXT NOT NULL,
            role TEXT NOT NULL,
            city TEXT NOT NULL,
            cnic TEXT
        )''')
        c.executescript('''CREATE TABLE IF NOT EXISTS workers(user_id INTEGER PRIMARY KEY REFERENCES users(id), skill TEXT NOT NULL, extra_skills TEXT NOT NULL DEFAULT '[]', bio TEXT NOT NULL DEFAULT '', rate INTEGER NOT NULL DEFAULT 1000, available INTEGER NOT NULL DEFAULT 1, verified INTEGER NOT NULL DEFAULT 0, photo TEXT);
        CREATE TABLE IF NOT EXISTS jobs(id INTEGER PRIMARY KEY, customer_id INTEGER NOT NULL REFERENCES users(id), worker_id INTEGER NOT NULL REFERENCES users(id), description TEXT NOT NULL, budget INTEGER NOT NULL, scheduled_at TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending', agreed_price INTEGER, photo TEXT, created_at TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS reviews(id INTEGER PRIMARY KEY, job_id INTEGER UNIQUE NOT NULL REFERENCES jobs(id), reviewer_id INTEGER NOT NULL REFERENCES users(id), worker_id INTEGER NOT NULL REFERENCES users(id), safety INTEGER NOT NULL, quality INTEGER NOT NULL, punctuality INTEGER NOT NULL, professionalism INTEGER NOT NULL, communication INTEGER NOT NULL, comment TEXT NOT NULL DEFAULT '');
        CREATE TABLE IF NOT EXISTS notifications(id INTEGER PRIMARY KEY, phone TEXT NOT NULL, skill TEXT NOT NULL, city TEXT NOT NULL, created_at TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS sessions(token_hash TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), csrf_hash TEXT, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL, revoked_at INTEGER);
        CREATE INDEX IF NOT EXISTS sessions_user_id ON sessions(user_id);
        CREATE TABLE IF NOT EXISTS password_reset_tokens(token_hash TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL, consumed_at INTEGER);
        CREATE INDEX IF NOT EXISTS password_reset_user_id ON password_reset_tokens(user_id);
        CREATE TABLE IF NOT EXISTS auth_rate_limits(scope TEXT NOT NULL, key_hash TEXT NOT NULL, occurred_at INTEGER NOT NULL);
        CREATE INDEX IF NOT EXISTS auth_rate_limits_lookup ON auth_rate_limits(scope,key_hash,occurred_at);
        CREATE TABLE IF NOT EXISTS schema_migrations(name TEXT PRIMARY KEY, applied_at INTEGER NOT NULL);''')
        worker_columns={row['name'] for row in c.execute('PRAGMA table_info(workers)').fetchall()}
        session_columns={row['name'] for row in c.execute('PRAGMA table_info(sessions)').fetchall()}
        if 'csrf_hash' not in session_columns:
            c.execute('ALTER TABLE sessions ADD COLUMN csrf_hash TEXT')
        for name,definition in {
            'neighborhood':"TEXT NOT NULL DEFAULT ''",
            'experience_years':'INTEGER NOT NULL DEFAULT 0',
            'pricing_type':"TEXT NOT NULL DEFAULT 'job'",
        }.items():
            if name not in worker_columns:c.execute(f'ALTER TABLE workers ADD COLUMN {name} {definition}')
        for user in c.execute('SELECT id,phone FROM users').fetchall():
            phone=user['phone']
            if re.fullmatch(r'03[0-9]{9}',phone):
                normalized='+92'+phone[1:]
                if not c.execute('SELECT 1 FROM users WHERE phone=? AND id!=?',(normalized,user['id'])).fetchone():
                    c.execute('UPDATE users SET phone=? WHERE id=?',(normalized,user['id']))
        count=c.execute('SELECT COUNT(*) FROM users').fetchone()[0]
        if not count:
            for name,phone,skill,city,rate,bio in [
                ('Ahmed Raza','+923000000001','Electrician','Islamabad',1500,'Wiring, switches and safe electrical repairs.'),
                ('Bilal Khan','+923000000002','Plumber','Rawalpindi',1200,'Leaks, taps and plumbing installations.'),
                ('Usman Ali','+923000000003','AC Technician','Islamabad',2200,'AC servicing, cooling and maintenance.'),
                ('Hassan Malik','+923000000004','Carpenter','Rawalpindi',1800,'Furniture assembly and wood repairs.'),
                ('Sajid Iqbal','+923000000005','Painter','Islamabad',2000,'Interior painting and finishing.'),
                ('Farhan Akram','+923000000006','Cleaner','Rawalpindi',1000,'Residential cleaning and deep cleaning.'),
                ('Nadia Perveen','+923000000007','Cleaner','Islamabad',1300,'Home cleaning, kitchen care and organized deep cleaning.'),
                ('Imran Shah','+923000000008','Mechanic','Rawalpindi',1800,'Motorcycle diagnostics, servicing and roadside repairs.')]:
                salt=secrets.token_hex(16)
                pw=hashlib.pbkdf2_hmac('sha256',secrets.token_bytes(32),bytes.fromhex(salt),PASSWORD_ITERATIONS).hex()
                cur=c.execute('INSERT INTO users(name,phone,password_hash,salt,role,city) VALUES(?,?,?,?,?,?)',(name,phone,pw,salt,'worker',city))
                c.execute('INSERT INTO workers(user_id,skill,bio,rate) VALUES(?,?,?,?)',(cur.lastrowid,skill,bio,rate))
        seeded=[
            ('+923000000001','Ahmed Raza','F-10',7,'job','/images/workers/ahmed-raza.png'),
            ('+923000000002','Bilal Khan','Satellite Town',11,'job','/images/workers/bilal-khan.png'),
            ('+923000000005','Sajida Iqbal','G-11',6,'job','/images/workers/sajida-iqbal.png'),
        ]
        for phone,name,neighborhood,years,pricing,photo in seeded:
            c.execute('UPDATE users SET name=? WHERE phone=?',(name,phone))
            c.execute('UPDATE workers SET neighborhood=?,experience_years=?,pricing_type=?,photo=? WHERE user_id=(SELECT id FROM users WHERE phone=?)',(neighborhood,years,pricing,photo,phone))
        if not c.execute("SELECT 1 FROM schema_migrations WHERE name='retire-seeded-passwords'").fetchone():
            for phone in ('+923000000001','+923000000002','+923000000003','+923000000004','+923000000005','+923000000006','+923000000007','+923000000008'):
                user=c.execute('SELECT id,password_hash,salt FROM users WHERE phone=?',(phone,)).fetchone()
                if user:
                    old_hash=hashlib.pbkdf2_hmac('sha256',b'Demo12345!',bytes.fromhex(user['salt']),PASSWORD_ITERATIONS).hex()
                    if hmac.compare_digest(user['password_hash'],old_hash):
                        salt=secrets.token_hex(16)
                        unusable_hash=hashlib.pbkdf2_hmac('sha256',secrets.token_bytes(32),bytes.fromhex(salt),PASSWORD_ITERATIONS).hex()
                        c.execute('UPDATE users SET password_hash=?,salt=? WHERE id=?',(unusable_hash,salt,user['id']))
            c.execute("INSERT INTO schema_migrations(name,applied_at) VALUES('retire-seeded-passwords',?)",(int(datetime.now(timezone.utc).timestamp()),))
        now=int(datetime.now(timezone.utc).timestamp())
        c.execute('DELETE FROM sessions WHERE expires_at < ?', (now,))
        c.execute('DELETE FROM password_reset_tokens WHERE expires_at < ? OR consumed_at < ?', (now-86400,now-86400))
        c.execute('DELETE FROM auth_rate_limits WHERE occurred_at < ?', (now-86400,))
init()

class Register(BaseModel):
    name:str=Field(min_length=2,max_length=100)
    phone:str=Field(min_length=10,max_length=20)
    password:str=Field(min_length=12,max_length=128)
    role:str
    city:str=Field(min_length=2,max_length=80)
    cnic:Optional[str]=Field(default=None,max_length=15)
    skill:Optional[str]=None
    extra_skills:list[str]=Field(default_factory=list)
    bio:str=''
    rate:int=Field(default=1000,ge=0)
    neighborhood:str=Field(default='',max_length=100)
    experience_years:int=Field(default=0,ge=0,le=60)
    pricing_type:str=Field(default='job',pattern='^(job|hour)$')

    @field_validator('phone')
    @classmethod
    def validate_phone(cls,value:str)->str:
        return normalize_phone(value)

    @field_validator('cnic')
    @classmethod
    def validate_cnic(cls,value:Optional[str])->Optional[str]:
        return normalize_cnic(value) if value else None
class WorkerUpdate(BaseModel):
    photo:Optional[str]=None
    neighborhood:Optional[str]=Field(default=None,max_length=100)
    experience_years:Optional[int]=Field(default=None,ge=0,le=60)
    pricing_type:Optional[str]=Field(default=None,pattern='^(job|hour)$')
    bio:Optional[str]=Field(default=None,max_length=1000)
class Login(BaseModel):
    phone:str=Field(min_length=10,max_length=20)
    password:str=Field(min_length=1,max_length=128)

    @field_validator('phone')
    @classmethod
    def validate_phone(cls,value:str)->str:
        return normalize_phone(value)

class ForgotPassword(BaseModel):
    phone:str=Field(min_length=10,max_length=20)

    @field_validator('phone')
    @classmethod
    def validate_phone(cls,value:str)->str:
        return normalize_phone(value)

class ResetPassword(BaseModel):
    phone:str=Field(min_length=10,max_length=20)
    token:str=Field(min_length=8,max_length=8,pattern='^[0-9]{8}$')
    password:str=Field(min_length=12,max_length=128)

    @field_validator('phone')
    @classmethod
    def validate_phone(cls,value:str)->str:
        return normalize_phone(value)

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
    phone:str=Field(min_length=10,max_length=20)
    skill:str
    city:str

    @field_validator('phone')
    @classmethod
    def validate_phone(cls,value:str)->str:
        return normalize_phone(value)

def normalize_phone(value:str)->str:
    if not isinstance(value,str):
        raise ValueError('Enter a Pakistani mobile number in 03XXXXXXXXX or +923XXXXXXXXX format.')
    if re.fullmatch(r'03[0-9]{9}',value):
        return '+92'+value[1:]
    if re.fullmatch(r'\+923[0-9]{9}',value):
        return value
    if re.fullmatch(r'923[0-9]{9}',value):
        return '+'+value
    raise ValueError('Enter a Pakistani mobile number in 03XXXXXXXXX or +923XXXXXXXXX format.')

def phone_variants(phone:str)->tuple[str,str]:
    return phone,'0'+phone[3:]

def normalize_cnic(value:str)->str:
    if not isinstance(value,str) or not re.fullmatch(r'(?:[0-9]{13}|[0-9]{5}-[0-9]{7}-[0-9])',value):
        raise ValueError('CNIC must contain 13 digits (XXXXX-XXXXXXX-X).')
    digits=value.replace('-','')
    return f'{digits[:5]}-{digits[5:12]}-{digits[12]}'

def hash_token(token:str)->str:
    return hashlib.sha256(token.encode('utf-8')).hexdigest()

def issue_session(c, user_id:int)->tuple[str,str]:
    token=secrets.token_urlsafe(32)
    csrf_token=secrets.token_urlsafe(32)
    now=int(datetime.now(timezone.utc).timestamp())
    c.execute('INSERT INTO sessions(token_hash,user_id,csrf_hash,created_at,expires_at) VALUES(?,?,?,?,?)',(hash_token(token),user_id,hash_token(csrf_token),now,now+SESSION_TTL_SECONDS))
    return token,csrf_token

def set_session_cookies(response:Response,token:str,csrf_token:str)->None:
    secure=os.getenv('APP_ENV','development').lower()=='production'
    response.set_cookie('roshan_session',token,max_age=SESSION_TTL_SECONDS,httponly=True,secure=secure,samesite='lax',path='/')
    response.set_cookie('roshan_csrf',csrf_token,max_age=SESSION_TTL_SECONDS,httponly=False,secure=secure,samesite='lax',path='/')

def clear_session_cookies(response:Response)->None:
    secure=os.getenv('APP_ENV','development').lower()=='production'
    response.delete_cookie('roshan_session',path='/',secure=secure,httponly=True,samesite='lax')
    response.delete_cookie('roshan_csrf',path='/',secure=secure,samesite='lax')

def request_ip(request:Request)->str:
    return request.client.host if request.client else 'unknown'

def enforce_rate_limit(c,scope:str,key:str,limit:int,window_seconds:int)->None:
    now=int(datetime.now(timezone.utc).timestamp())
    key_hash=hash_token(key)
    cutoff=now-window_seconds
    count=c.execute('SELECT COUNT(*) FROM auth_rate_limits WHERE scope=? AND key_hash=? AND occurred_at>?',(scope,key_hash,cutoff)).fetchone()[0]
    if count>=limit:
        oldest=c.execute('SELECT MIN(occurred_at) FROM auth_rate_limits WHERE scope=? AND key_hash=? AND occurred_at>?',(scope,key_hash,cutoff)).fetchone()[0]
        retry_after=max(1,int(oldest)+window_seconds-now)
        raise HTTPException(429,'Too many attempts. Please try again later.',headers={'Retry-After':str(retry_after)})
    c.execute('INSERT INTO auth_rate_limits(scope,key_hash,occurred_at) VALUES(?,?,?)',(scope,key_hash,now))

def reset_delivery_configured()->bool:
    return all(os.getenv(name) for name in ('TWILIO_ACCOUNT_SID','TWILIO_AUTH_TOKEN','TWILIO_FROM_NUMBER'))

def send_password_reset_sms(phone:str,token:str)->None:
    if not reset_delivery_configured():
        raise HTTPException(503,'Password recovery is not configured. Contact support.')
    account=os.environ['TWILIO_ACCOUNT_SID']
    credentials=base64.b64encode(f"{account}:{os.environ['TWILIO_AUTH_TOKEN']}".encode()).decode()
    url=f'https://api.twilio.com/2010-04-01/Accounts/{urllib.parse.quote(account,safe="")}/Messages.json'
    body=urllib.parse.urlencode({
        'To':phone,
        'From':os.environ['TWILIO_FROM_NUMBER'],
        'Body':f'Roshan Rozgar password reset code: {token}. It expires in 15 minutes. If you did not request it, ignore this message.',
    }).encode()
    request=urllib.request.Request(url,data=body,headers={'Authorization':f'Basic {credentials}','Content-Type':'application/x-www-form-urlencoded'},method='POST')
    try:
        with urllib.request.urlopen(request,timeout=10) as response:
            if response.status < 200 or response.status >= 300:
                raise HTTPException(502,'Password reset delivery failed.')
    except urllib.error.HTTPError as error:
        raise HTTPException(502,'Password reset delivery failed.') from error
    except urllib.error.URLError as error:
        raise HTTPException(502,'Password reset delivery is temporarily unavailable.') from error

def auth(authorization:Optional[str]):
    if not authorization or not authorization.startswith('Bearer '): raise HTTPException(401,'Please log in')
    token=authorization[7:]
    if not token or len(token)>256: raise HTTPException(401,'Session expired or revoked')
    now=int(datetime.now(timezone.utc).timestamp())
    with db() as c:
        user=c.execute('''SELECT u.id,u.name,u.phone,u.role,u.city FROM sessions s
            JOIN users u ON u.id=s.user_id
            WHERE s.token_hash=? AND s.revoked_at IS NULL AND s.expires_at>?''',(hash_token(token),now)).fetchone()
    if not user: raise HTTPException(401,'Session expired or revoked')
    return dict(user)

def worker_dict(r):
    d=dict(r);d['extra_skills']=json.loads(d['extra_skills']);d['available']=bool(d['available']);d['verified']=bool(d['verified']);return d

@app.get('/api/health')
def health(): return {'status':'ok','app':'Roshan Rozgar AI'}
@app.post('/api/auth/register')
def register(payload:Register,request:Request,response:Response):
    if payload.role not in ('customer','worker'): raise HTTPException(400,'Invalid role')
    if payload.role=='worker' and not payload.skill: raise HTTPException(400,'Main skill required')
    with db() as c:
        c.execute('BEGIN IMMEDIATE')
        enforce_rate_limit(c,'register-ip',request_ip(request),20,3600)
        c.commit()
    salt=secrets.token_hex(16)
    pw=hashlib.pbkdf2_hmac('sha256',payload.password.encode(),bytes.fromhex(salt),PASSWORD_ITERATIONS).hex()
    with db() as c:
        try:
            c.execute('BEGIN IMMEDIATE')
            variants=phone_variants(payload.phone)
            if c.execute('SELECT 1 FROM users WHERE phone IN (?,?) LIMIT 1',variants).fetchone():
                c.rollback()
                raise HTTPException(409,'Phone already registered')
            cur=c.execute('INSERT INTO users(name,phone,password_hash,salt,role,city) VALUES(?,?,?,?,?,?)',(payload.name,payload.phone,pw,salt,payload.role,payload.city))
            if payload.role=='worker': c.execute('INSERT INTO workers(user_id,skill,extra_skills,bio,rate,neighborhood,experience_years,pricing_type) VALUES(?,?,?,?,?,?,?,?)',(cur.lastrowid,payload.skill,json.dumps(payload.extra_skills),payload.bio,payload.rate,payload.neighborhood,payload.experience_years,payload.pricing_type))
            token,csrf_token=issue_session(c,cur.lastrowid)
            c.commit()
        except sqlite3.IntegrityError:
            c.rollback();raise HTTPException(409,'Phone already registered')
    set_session_cookies(response,token,csrf_token)
    return {'csrf_token':csrf_token,'user':{'id':cur.lastrowid,'name':payload.name,'role':payload.role,'city':payload.city}}
@app.post('/api/auth/login')
def login(payload:Login,request:Request,response:Response):
    with db() as c:
        c.execute('BEGIN IMMEDIATE')
        enforce_rate_limit(c,'login-ip',request_ip(request),20,900)
        enforce_rate_limit(c,'login-phone',payload.phone,5,900)
        candidates=c.execute('SELECT * FROM users WHERE phone IN (?,?)',phone_variants(payload.phone)).fetchall()
        matches=[]
        for candidate in candidates:
            salt=bytes.fromhex(candidate['salt'])
            check=hashlib.pbkdf2_hmac('sha256',payload.password.encode(),salt,PASSWORD_ITERATIONS).hex()
            if hmac.compare_digest(check,candidate['password_hash']):
                matches.append(candidate)
        if not candidates:
            check=hashlib.pbkdf2_hmac('sha256',payload.password.encode(),bytes(16),PASSWORD_ITERATIONS).hex()
            hmac.compare_digest(check,DUMMY_PASSWORD_HASH)
        if len(matches)!=1:
            c.commit()
            raise HTTPException(401,'Invalid phone number or password.')
        u=matches[0]
        token,csrf_token=issue_session(c,u['id'])
        c.commit()
    set_session_cookies(response,token,csrf_token)
    return {'csrf_token':csrf_token,'user':{'id':u['id'],'name':u['name'],'role':u['role'],'city':u['city']}}

@app.get('/api/auth/csrf')
def csrf(request:Request,response:Response):
    session_token=request.cookies.get('roshan_session')
    if not session_token:
        raise HTTPException(401,'Please log in')
    user=auth('Bearer '+session_token)
    csrf_token=secrets.token_urlsafe(32)
    with db() as c:
        c.execute('UPDATE sessions SET csrf_hash=? WHERE token_hash=? AND user_id=?',(hash_token(csrf_token),hash_token(session_token),user['id']))
    secure=os.getenv('APP_ENV','development').lower()=='production'
    response.set_cookie('roshan_csrf',csrf_token,max_age=SESSION_TTL_SECONDS,httponly=False,secure=secure,samesite='lax',path='/')
    return {'csrf_token':csrf_token}

@app.post('/api/auth/logout')
def logout(response:Response,authorization:Optional[str]=Header(None)):
    user=auth(authorization)
    token=authorization[7:]
    with db() as c:
        c.execute('UPDATE sessions SET revoked_at=? WHERE token_hash=? AND user_id=? AND revoked_at IS NULL',(int(datetime.now(timezone.utc).timestamp()),hash_token(token),user['id']))
    clear_session_cookies(response)
    return {'status':'logged_out'}

@app.post('/api/auth/logout-all')
def logout_all(response:Response,authorization:Optional[str]=Header(None)):
    user=auth(authorization)
    with db() as c:
        c.execute('UPDATE sessions SET revoked_at=? WHERE user_id=? AND revoked_at IS NULL',(int(datetime.now(timezone.utc).timestamp()),user['id']))
    clear_session_cookies(response)
    return {'status':'logged_out'}

@app.post('/api/auth/forgot-password')
def forgot_password(payload:ForgotPassword,request:Request):
    if not reset_delivery_configured():
        raise HTTPException(503,'Password recovery is not configured. Contact support.')
    now=int(datetime.now(timezone.utc).timestamp())
    with db() as c:
        c.execute('BEGIN IMMEDIATE')
        enforce_rate_limit(c,'reset-ip',request_ip(request),5,900)
        enforce_rate_limit(c,'reset-phone',payload.phone,3,3600)
        users=c.execute('SELECT id FROM users WHERE phone IN (?,?)',phone_variants(payload.phone)).fetchall()
        if len(users)!=1:
            c.commit()
            return {'status':'accepted','message':'If an account matches, a recovery code will be sent.'}
        user=users[0]
        token=f'{secrets.randbelow(100_000_000):08d}'
        token_hash=hash_token(token)
        while c.execute('SELECT 1 FROM password_reset_tokens WHERE token_hash=?',(token_hash,)).fetchone():
            token=f'{secrets.randbelow(100_000_000):08d}'
            token_hash=hash_token(token)
        c.execute('UPDATE password_reset_tokens SET consumed_at=? WHERE user_id=? AND consumed_at IS NULL',(now,user['id']))
        c.execute('INSERT INTO password_reset_tokens(token_hash,user_id,created_at,expires_at) VALUES(?,?,?,?)',(token_hash,user['id'],now,now+RESET_TTL_SECONDS))
        c.commit()
    try:
        send_password_reset_sms(payload.phone,token)
    except HTTPException:
        with db() as c:
            c.execute('DELETE FROM password_reset_tokens WHERE token_hash=?',(token_hash,))
        raise
    return {'status':'accepted','message':'If an account matches, a recovery code will be sent.'}

@app.post('/api/auth/reset-password')
def reset_password(payload:ResetPassword,request:Request,response:Response):
    now=int(datetime.now(timezone.utc).timestamp())
    with db() as c:
        c.execute('BEGIN IMMEDIATE')
        enforce_rate_limit(c,'reset-complete-ip',request_ip(request),10,900)
        enforce_rate_limit(c,'reset-complete-phone',payload.phone,5,3600)
        record=c.execute('''SELECT token_hash,user_id FROM password_reset_tokens
            WHERE token_hash=? AND expires_at>? AND consumed_at IS NULL''',(hash_token(payload.token),now)).fetchone()
        users=c.execute('SELECT id FROM users WHERE phone IN (?,?)',phone_variants(payload.phone)).fetchall()
        if not record or not any(user['id']==record['user_id'] for user in users):
            c.commit()
            raise HTTPException(400,'Recovery code is invalid or expired.')
        user_id=record['user_id']
        salt=secrets.token_hex(16)
        password_hash=hashlib.pbkdf2_hmac('sha256',payload.password.encode(),bytes.fromhex(salt),PASSWORD_ITERATIONS).hex()
        c.execute('UPDATE users SET password_hash=?,salt=? WHERE id=?',(password_hash,salt,user_id))
        c.execute('UPDATE sessions SET revoked_at=? WHERE user_id=? AND revoked_at IS NULL',(now,user_id))
        c.execute('UPDATE password_reset_tokens SET consumed_at=? WHERE user_id=? AND consumed_at IS NULL',(now,user_id))
        c.commit()
    clear_session_cookies(response)
    return {'status':'password_reset'}

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
