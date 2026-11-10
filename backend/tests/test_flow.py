import sys
from pathlib import Path
from fastapi.testclient import TestClient
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from app import main
from app.main import app
import secrets

client=TestClient(app)
STRONG_PASSWORD='StrongDemoPass123!'

@pytest.fixture(autouse=True)
def clear_cookies():
    client.cookies.clear()
    yield
    client.cookies.clear()

@pytest.fixture(scope='session',autouse=True)
def isolated_test_database(tmp_path_factory):
    original=main.DB
    main.DB=tmp_path_factory.mktemp('roshan-tests')/'roshan.db'
    main.init()
    yield
    main.DB=original

def pakistan_mobile():
    return '03'+f'{secrets.randbelow(10**9):09d}'

def csrf_headers():
    token=client.cookies.get('roshan_csrf')
    return {'X-CSRF-Token':token} if token else {}

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
    registered=client.post('/api/auth/register',json={'name':'Photo Worker','phone':pakistan_mobile(),'password':STRONG_PASSWORD,'role':'worker','city':'Islamabad','skill':'Painter','neighborhood':'G-10','experience_years':4,'pricing_type':'hour'})
    assert registered.status_code==200,registered.text
    headers={'Authorization':'Bearer '+client.cookies.get('roshan_session')}
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
    def register(role,skill=None):
        payload={'name':'Demo '+role,'phone':pakistan_mobile(),'password':STRONG_PASSWORD,'role':role,'city':'Islamabad'}
        if skill:payload['skill']=skill
        r=client.post('/api/auth/register',json=payload,headers=csrf_headers())
        assert r.status_code==200,r.text
        account=r.json()
        account['token']=client.cookies.get('roshan_session')
        return account
    customer=register('customer')
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

def register_user(role='customer',phone=None,cnic=None):
    payload={'name':'Auth Test User','phone':phone or pakistan_mobile(),'password':STRONG_PASSWORD,'role':role,'city':'Islamabad'}
    if role=='worker':
        payload['skill']='Electrician'
    if cnic is not None:
        payload['cnic']=cnic
    response=client.post('/api/auth/register',json=payload,headers=csrf_headers())
    assert response.status_code==200,response.text
    account=response.json()
    assert 'token' not in account
    account['token']=client.cookies.get('roshan_session')
    assert len(account['token'])>=40
    return account,payload['phone']

def bearer(account):
    return {'Authorization':'Bearer '+account['token']}

def test_customer_and_worker_signup_login_logout_revoke_sessions():
    for role in ('customer','worker'):
        account,phone=register_user(role)
        auth_headers=bearer(account)
        assert client.get('/api/me',headers=auth_headers).json()['role']==role
        session_hash=main.hash_token(account['token'])
        login=client.post('/api/auth/login',json={'phone':phone,'password':STRONG_PASSWORD},headers=csrf_headers())
        assert login.status_code==200,login.text
        assert 'token' not in login.json()
        second_headers={'Authorization':'Bearer '+client.cookies.get('roshan_session')}
        assert client.get('/api/me',headers=second_headers).status_code==200
        assert client.post('/api/auth/logout',headers=auth_headers).json()['status']=='logged_out'
        assert client.get('/api/me',headers=auth_headers).status_code==401
        assert client.get('/api/me',headers=second_headers).status_code==200
        with main.db() as connection:
            assert connection.execute('SELECT revoked_at FROM sessions WHERE token_hash=?',(session_hash,)).fetchone()['revoked_at'] is not None
        assert client.post('/api/auth/logout-all',headers=second_headers).status_code==200
        assert client.get('/api/me',headers=second_headers).status_code==401

def test_expired_sessions_and_unauthorized_role_access():
    customer,_=register_user()
    headers=bearer(customer)
    with main.db() as connection:
        connection.execute('UPDATE sessions SET expires_at=? WHERE token_hash=?',(int(main.datetime.now(main.timezone.utc).timestamp())-1,main.hash_token(customer['token'])))
    assert client.get('/api/me',headers=headers).status_code==401
    assert client.get('/api/jobs').status_code==401
    worker,_=register_user('worker')
    assert client.post('/api/jobs/1/accept',headers=bearer(customer),json={'agreed_price':1000}).status_code==401
    assert client.post('/api/jobs',headers=bearer(worker),json={'worker_id':worker['user']['id'],'description':'Repair a wall socket','budget':1000,'scheduled_at':'2026-12-01T12:00'}).status_code==403

def test_pakistani_phone_and_cnic_validation_and_cnic_privacy():
    for phone in (pakistan_mobile(),'+923'+f'{secrets.randbelow(10**9):09d}','923'+f'{secrets.randbelow(10**9):09d}'):
        response=client.post('/api/auth/register',json={'name':'Validation User','phone':phone,'password':STRONG_PASSWORD,'role':'customer','city':'Islamabad','cnic':'1234567890123'},headers=csrf_headers())
        assert response.status_code==200,response.text
        account=response.json()
        account['token']=client.cookies.get('roshan_session')
        assert client.get('/api/me',headers=bearer(account)).json()['phone'].startswith('+923')
        assert 'cnic' not in response.json()['user']
        with main.db() as connection:
            saved=connection.execute('SELECT cnic FROM users WHERE id=?',(response.json()['user']['id'],)).fetchone()
            assert saved['cnic'] is None
    invalid_phones=('0512345678','0301234567','030123456789','+92301234567','+9230123456789','03ABC456789',' 03012345678')
    for phone in invalid_phones:
        response=client.post('/api/auth/register',json={'name':'Invalid Phone','phone':phone,'password':STRONG_PASSWORD,'role':'customer','city':'Islamabad'},headers=csrf_headers())
        assert response.status_code==422,(phone,response.text)
    for cnic in ('123456789012','12345678901234','12345-1234567-12','1234A67890123','١٢٣٤٥٦٧٨٩٠١٢٣'):
        response=client.post('/api/auth/register',json={'name':'Invalid CNIC','phone':pakistan_mobile(),'password':STRONG_PASSWORD,'role':'customer','city':'Islamabad','cnic':cnic},headers=csrf_headers())
        assert response.status_code==422,(cnic,response.text)

def test_password_reset_tokens_expire_revoke_sessions_and_are_single_use(monkeypatch):
    account,phone=register_user()
    captured=[]
    monkeypatch.setenv('TWILIO_ACCOUNT_SID','test-account')
    monkeypatch.setenv('TWILIO_AUTH_TOKEN','test-token')
    monkeypatch.setenv('TWILIO_FROM_NUMBER','+15005550006')
    monkeypatch.setattr(main,'send_password_reset_sms',lambda number,token:captured.append((number,token)))
    unknown=client.post('/api/auth/forgot-password',json={'phone':pakistan_mobile()},headers=csrf_headers())
    request=client.post('/api/auth/forgot-password',json={'phone':phone},headers=csrf_headers())
    assert request.status_code==200
    assert unknown.status_code==request.status_code
    assert unknown.json()==request.json()
    assert request.json()['status']=='accepted'
    assert len(captured)==1 and captured[0][0].startswith('+923')
    assert len(captured[0][1])==8 and captured[0][1].isascii() and captured[0][1].isdigit()
    assert captured[0][1] not in request.text
    token=captured[0][1]
    malformed=client.post('/api/auth/reset-password',json={'phone':phone,'token':'not-a-code','password':'BrandNewSecurePass123!'},headers=csrf_headers())
    assert malformed.status_code==422
    reset=client.post('/api/auth/reset-password',json={'phone':phone,'token':token,'password':'BrandNewSecurePass123!'},headers=csrf_headers())
    assert reset.status_code==200,reset.text
    assert client.get('/api/me',headers=bearer(account)).status_code==401
    assert client.post('/api/auth/reset-password',json={'phone':phone,'token':token,'password':'AnotherSecurePass123!'},headers=csrf_headers()).status_code==400
    assert client.post('/api/auth/login',json={'phone':phone,'password':STRONG_PASSWORD}).status_code==401
    assert client.post('/api/auth/login',json={'phone':phone,'password':'BrandNewSecurePass123!'}).status_code==200
    expiry=client.post('/api/auth/forgot-password',json={'phone':phone},headers=csrf_headers())
    assert expiry.status_code==200
    expired_token=captured[-1][1]
    with main.db() as connection:
        connection.execute('UPDATE password_reset_tokens SET expires_at=? WHERE token_hash=?',(int(main.datetime.now(main.timezone.utc).timestamp())-1,main.hash_token(expired_token)))
    assert client.post('/api/auth/reset-password',json={'phone':phone,'token':expired_token,'password':'ExpiredTokenSecure123!'},headers=csrf_headers()).status_code==400

def test_cookie_sessions_are_http_only_and_require_csrf():
    account,_=register_user()
    assert client.get('/api/me').status_code==200
    response=client.post('/api/auth/logout')
    assert response.status_code==403
    session_cookie=next(cookie for cookie in client.cookies.jar if cookie.name=='roshan_session')
    assert session_cookie.has_nonstandard_attr('HttpOnly')
    csrf=client.get('/api/auth/csrf')
    assert csrf.status_code==200
    token=csrf.json()['csrf_token']
    logout=client.post('/api/auth/logout',headers={'X-CSRF-Token':token})
    assert logout.status_code==200
    assert client.get('/api/me').status_code==401

def test_login_rate_limit_and_recovery_configuration(monkeypatch):
    phone=pakistan_mobile()
    for _ in range(5):
        response=client.post('/api/auth/login',json={'phone':phone,'password':'incorrect password'})
        assert response.status_code==401
    limited=client.post('/api/auth/login',json={'phone':phone,'password':'incorrect password'})
    assert limited.status_code==429
    monkeypatch.delenv('TWILIO_ACCOUNT_SID',raising=False)
    monkeypatch.delenv('TWILIO_AUTH_TOKEN',raising=False)
    monkeypatch.delenv('TWILIO_FROM_NUMBER',raising=False)
    unavailable=client.post('/api/auth/forgot-password',json={'phone':pakistan_mobile()})
    assert unavailable.status_code==503
    assert 'not configured' in unavailable.json()['detail']
