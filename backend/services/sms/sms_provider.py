import logging
import httpx
from abc import ABC, abstractmethod
from backend.config.settings import settings

logger = logging.getLogger(__name__)


class BaseSMSProvider(ABC):
    """Abstract Base Class for SMS OTP Providers."""

    @abstractmethod
    async def send_otp(self, phone: str, otp: str) -> bool:
        """Send OTP to the given phone number via SMS provider."""
        pass


class TextbeltSMSProvider(BaseSMSProvider):
    """Textbelt SMS Provider implementation (https://textbelt.com)."""

    def __init__(self):
        self.api_key = settings.SMS_API_KEY or "textbelt"

    async def send_otp(self, phone: str, otp: str) -> bool:
        formatted_phone = phone if phone.startswith("+") else f"+91{phone}"
        url = "https://textbelt.com/text"
        data = {
            "phone": formatted_phone,
            "message": f"Your BhumiSetu verification code is {otp}. Valid for 5 minutes.",
            "key": self.api_key
        }
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(url, data=data)
                if response.status_code == 200:
                    res_json = response.json()
                    if res_json.get("success"):
                        logger.info(f"[Textbelt SMS] Successfully sent SMS to {formatted_phone}")
                        return True
                    else:
                        logger.warning(f"[Textbelt SMS] Response: {res_json.get('error')}")
                        return False
                return False
        except Exception as e:
            logger.error(f"[Textbelt SMS] Exception: {str(e)}")
            return False


class Fast2SMSSMSProvider(BaseSMSProvider):
    """Fast2SMS Indian SMS Provider implementation (https://www.fast2sms.com)."""

    def __init__(self):
        self.api_key = settings.SMS_API_KEY
        self.endpoint = "https://www.fast2sms.com/dev/bulkV2"

    async def send_otp(self, phone: str, otp: str) -> bool:
        clean_phone = phone.replace("+91", "").replace("+", "").replace(" ", "").strip()
        headers = {
            "authorization": self.api_key,
            "Content-Type": "application/json"
        }
        payload = {
            "variables_values": otp,
            "route": "otp",
            "numbers": clean_phone
        }
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(self.endpoint, json=payload, headers=headers)
                if response.status_code == 200:
                    data = response.json()
                    if data.get("return") is True:
                        logger.info(f"[Fast2SMS] Successfully dispatched OTP SMS to +91{clean_phone[:3]}XXXXX")
                        return True
                    else:
                        logger.error(f"[Fast2SMS] Gateway response error: {data.get('message')}")
                        return False
                else:
                    logger.error(f"[Fast2SMS] HTTP {response.status_code}: {response.text}")
                    return False
        except Exception as e:
            logger.error(f"[Fast2SMS] Exception sending SMS: {str(e)}")
            return False


class MSG91SMSProvider(BaseSMSProvider):
    """MSG91 Indian SMS Provider implementation (https://msg91.com)."""

    def __init__(self):
        self.api_key = settings.SMS_API_KEY
        self.template_id = settings.SMS_TEMPLATE_ID
        self.endpoint = "https://api.msg91.com/api/v5/otp"

    async def send_otp(self, phone: str, otp: str) -> bool:
        clean_phone = phone.replace("+", "").replace(" ", "")
        payload = {
            "template_id": self.template_id,
            "mobile": clean_phone,
            "otp": otp,
        }
        headers = {
            "authkey": self.api_key,
            "Content-Type": "application/json"
        }
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(self.endpoint, json=payload, headers=headers)
                if response.status_code == 200:
                    data = response.json()
                    if data.get("type") == "success":
                        logger.info(f"[MSG91 SMS] Successfully sent OTP to {clean_phone[:6]}XXXX")
                        return True
                    else:
                        logger.error(f"[MSG91 SMS] Gateway error: {data.get('message')}")
                        return False
                else:
                    logger.error(f"[MSG91 SMS] HTTP Status {response.status_code}: {response.text}")
                    return False
        except Exception as e:
            logger.error(f"[MSG91 SMS] Exception sending SMS: {str(e)}")
            return False


class TwoFactorSMSProvider(BaseSMSProvider):
    """2Factor.in Indian SMS Provider implementation (https://2factor.in)."""

    def __init__(self):
        self.api_key = settings.SMS_API_KEY

    async def send_otp(self, phone: str, otp: str) -> bool:
        clean_phone = phone.replace("+91", "").replace("+", "").strip()
        url = f"https://2factor.in/API/V1/{self.api_key}/SMS/+91{clean_phone}/{otp}/AUTOGEN"
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(url)
                if response.status_code == 200:
                    data = response.json()
                    if data.get("Status") == "Success":
                        logger.info(f"[2Factor SMS] Successfully sent OTP to +91{clean_phone[:3]}XXXXX")
                        return True
                    else:
                        logger.error(f"[2Factor SMS] Gateway error: {data.get('Details')}")
                        return False
                return False
        except Exception as e:
            logger.error(f"[2Factor SMS] Exception sending SMS: {str(e)}")
            return False


class TwilioSMSProvider(BaseSMSProvider):
    """Twilio SMS Provider implementation (https://twilio.com)."""

    def __init__(self):
        self.account_sid = settings.TWILIO_ACCOUNT_SID
        self.auth_token = settings.TWILIO_AUTH_TOKEN
        self.from_phone = settings.TWILIO_FROM_PHONE

    async def send_otp(self, phone: str, otp: str) -> bool:
        formatted_phone = phone if phone.startswith("+") else f"+91{phone}"
        url = f"https://api.twilio.com/2010-04-01/Accounts/{self.account_sid}/Messages.json"
        data = {
            "To": formatted_phone,
            "From": self.from_phone,
            "Body": f"Your BhumiSetu verification OTP is {otp}. Valid for 5 minutes."
        }
        try:
            async with httpx.AsyncClient(auth=(self.account_sid, self.auth_token), timeout=10.0) as client:
                response = await client.post(url, data=data)
                if response.status_code in [200, 201]:
                    logger.info(f"[Twilio SMS] Successfully sent OTP to {formatted_phone[:6]}XXXX")
                    return True
                else:
                    logger.error(f"[Twilio SMS] HTTP {response.status_code}: {response.text}")
                    return False
        except Exception as e:
            logger.error(f"[Twilio SMS] Exception sending SMS: {str(e)}")
            return False


class DevelopmentMockSMSProvider(BaseSMSProvider):
    """Development / Mock SMS Provider for testing when real SMS API keys are not provided."""

    async def send_otp(self, phone: str, otp: str) -> bool:
        masked = phone[:6] + "XXXX" if len(phone) >= 10 else phone
        logger.info(f"[DEV SMS SERVICE] SMS Dispatched to {masked}")
        return True


def get_sms_provider() -> BaseSMSProvider:
    """Factory to get configured SMS Provider based on settings.SMS_PROVIDER."""
    provider_type = (settings.SMS_PROVIDER or "mock").lower()

    if provider_type == "textbelt":
        return TextbeltSMSProvider()
    elif provider_type == "fast2sms" and settings.SMS_API_KEY:
        return Fast2SMSSMSProvider()
    elif provider_type == "msg91" and settings.SMS_API_KEY:
        return MSG91SMSProvider()
    elif provider_type == "2factor" and settings.SMS_API_KEY:
        return TwoFactorSMSProvider()
    elif provider_type == "twilio" and settings.TWILIO_ACCOUNT_SID:
        return TwilioSMSProvider()
    else:
        if provider_type != "mock" and not settings.SMS_API_KEY:
            logger.warning(
                f"[SMS CONFIG WARNING] Provider '{provider_type}' requested but no API key configured. "
                f"Falling back to DevelopmentMockSMSProvider."
            )
        return DevelopmentMockSMSProvider()
