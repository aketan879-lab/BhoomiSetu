import pytest
import asyncio
from fastapi import HTTPException
from backend.security.otp_manager import SecureOTPManager, otp_manager
from backend.api.auth import send_otp, verify_otp, SendOTPRequest, VerifyOTPRequest


@pytest.mark.asyncio
async def test_phone_sanitization_and_validation():
    mgr = SecureOTPManager()

    # Valid Indian mobile numbers
    assert mgr.sanitize_and_validate_phone("9876543210") == "+919876543210"
    assert mgr.sanitize_and_validate_phone("+919876543210") == "+919876543210"
    assert mgr.sanitize_and_validate_phone("09876543210") == "+919876543210"
    assert mgr.sanitize_and_validate_phone("+91 9876543210") == "+919876543210"

    # Invalid numbers
    with pytest.raises(HTTPException) as exc1:
        mgr.sanitize_and_validate_phone("12345")
    assert exc1.value.status_code == 400

    with pytest.raises(HTTPException) as exc2:
        mgr.sanitize_and_validate_phone("1234567890") # Doesn't start with 6,7,8,9
    assert exc2.value.status_code == 400


@pytest.mark.asyncio
async def test_otp_dispatch_does_not_expose_otp():
    req = SendOTPRequest(phone="9876543210")
    res = await send_otp(req)

    assert res["success"] is True
    assert res["phone"] == "+919876543210"
    assert res["cooldown_seconds"] == 60
    assert res["expires_in_seconds"] == 300
    # STRICT SECURITY CHECK: Ensure OTP is NOT in response!
    assert "otp" not in res
    assert "code" not in res


@pytest.mark.asyncio
async def test_otp_cooldown_rate_limit():
    mgr = SecureOTPManager()
    phone = "9876543211"

    # First request succeeds
    res1 = await mgr.send_otp(phone)
    assert res1["success"] is True

    # Immediate second request should trigger 429 rate limit
    with pytest.raises(HTTPException) as exc:
        await mgr.send_otp(phone)
    assert exc.value.status_code == 429
    assert "rate limit exceeded" in exc.value.detail.lower()


@pytest.mark.asyncio
async def test_otp_failed_attempts_limit():
    mgr = SecureOTPManager()
    phone = "9876543212"

    await mgr.send_otp(phone)

    # 4 invalid attempts
    for _ in range(4):
        with pytest.raises(HTTPException) as exc:
            await mgr.verify_otp(phone, "000000")
        assert exc.value.status_code == 400

    # 5th attempt reaches max limit and invalidates session
    with pytest.raises(HTTPException) as exc:
        await mgr.verify_otp(phone, "000000")
    assert exc.value.status_code in [400, 429]


@pytest.mark.asyncio
async def test_username_password_login():
    from backend.api.auth import login, PasswordLoginRequest

    # Web Admin Login
    admin_req = PasswordLoginRequest(username="Tahsildar1", password="123456")
    admin_res = await login(admin_req)
    assert admin_res["access_token"] is not None
    assert admin_res["user"]["username"] == "Tahsildar1"
    assert admin_res["user"]["role"] == "TEHSILDAR"

    # App User Login
    user_req = PasswordLoginRequest(username="Rakesh", password="1234567890")
    user_res = await login(user_req)
    assert user_res["access_token"] is not None
    assert user_res["user"]["username"] == "Rakesh"
    assert user_res["user"]["role"] == "FARMER"

    # Invalid Password
    bad_req = PasswordLoginRequest(username="Tahsildar1", password="wrongpassword")
    with pytest.raises(HTTPException) as exc:
        await login(bad_req)
    assert exc.value.status_code == 401

