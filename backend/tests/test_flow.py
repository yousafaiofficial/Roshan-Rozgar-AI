import sys
from pathlib import Path
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from app.main import app
import secrets

client=TestClient(app)

def test_health():
    r=client.get('/api/health')
    assert r.status_code==200 and r.json()['status']=='ok'

def test_workers_seeded():
    r=client.get('/api/workers')
    assert r.status_code==200
    assert len(r.json())>=6
    assert all(not w['verified'] for w in r.json() if w['id']<=6)
    assert all('completed_jobs' in w and 'experience_years' in w for w in r.json())

def test_worker_profile_photo_upload_and_update():
    suffix=secrets.token_hex(5)
    registered=client.post('/api/auth/register',json={'name':'Photo Worker','phone':'05'+suffix,'password':'Demo12345!','role':'worker','city':'Islamabad','skill':'Painter','neighborhood':'G-10','experience_years':4,'pricing_type':'hour'})
    assert registered.status_code==200,registered.text
    headers={'Authorization':'Bearer '+registered.json()['token']}
    upload=client.post('/api/uploads',headers=headers,files={'file':('profile.png',b'\x89PNG\r\n\x1a\nfictional-profile','image/png')})
    assert upload.status_code==200,upload.text
    updated=client.patch('/api/workers/me',headers=headers,json={'photo':upload.json()['url'],'bio':'Interior and exterior painter.'})
    assert updated.status_code==200,updated.text
    profile=client.get('/api/workers/'+str(registered.json()['user']['id']))
    assert profile.status_code==200
    assert profile.json()['photo']==upload.json()['url']
    assert profile.json()['neighborhood']=='G-10'
    bad=client.post('/api/uploads',headers=headers,files={'file':('fake.png',b'not an image','image/png')})
    assert bad.status_code==400

def test_booking_review_flow():
    suffix=secrets.token_hex(5)
    def register(role,skill=None):
        payload={'name':'Demo '+role,'phone':'03'+suffix,'password':'Demo12345!','role':role,'city':'Islamabad'}
        if skill:payload['skill']=skill
        r=client.post('/api/auth/register',json=payload)
        assert r.status_code==200,r.text
        return r.json()
    customer=register('customer')
    suffix=secrets.token_hex(5)
    worker=register('worker','Electrician')
    c={'Authorization':'Bearer '+customer['token']}
    w={'Authorization':'Bearer '+worker['token']}
    payload={'worker_id':worker['user']['id'],'description':'Switch and wiring need repair','budget':1500,'scheduled_at':'2026-12-01T12:00'}
    first=client.post('/api/jobs',headers=c,json=payload)
    assert first.status_code==200,first.text
    second=client.post('/api/jobs',headers=c,json=payload)
    assert second.status_code==200
    accepted=client.post(f"/api/jobs/{first.json()['id']}/accept",headers=w,json={'agreed_price':1400})
    assert accepted.status_code==200,accepted.text
    assert client.post(f"/api/jobs/{second.json()['id']}/accept",headers=w,json={'agreed_price':1500}).status_code==409
    assert client.get('/api/workers',params={'skill':'Electrician'}).status_code==200
    completed=client.post(f"/api/jobs/{first.json()['id']}/complete",headers=c)
    assert completed.status_code==200
    review=client.post(f"/api/jobs/{first.json()['id']}/review",headers=c,json={k:5 for k in ['safety','quality','punctuality','professionalism','communication']})
    assert review.status_code==200,review.text
