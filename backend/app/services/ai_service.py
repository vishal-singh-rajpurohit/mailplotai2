import json
import logging
from datetime import datetime
from typing import Dict, Any, List, Optional
from openai import AsyncOpenAI
from app.config import settings

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        # Initialize client if API key is present
        if settings.OPENAI_API_KEY:
            self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        else:
            self.client = None
            logger.warning("OPENAI_API_KEY not configured. Running in Mock AI fallback mode.")

    async def _call_llm(self, system_prompt: str, user_prompt: str, json_response: bool = False) -> str:
        """Helper to invoke OpenAI chat completion async."""
        if not self.client:
            raise ValueError("OpenAI client not initialized")
        
        response_format = {"type": "json_object"} if json_response else None
        
        response = await self.client.chat.completions.create(
            model=settings.OPENAI_CHAT_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format=response_format,
            temperature=0.2
        )
        return response.choices[0].message.content or ""

    async def analyze_email(self, subject: str, body: str, sender_name: str, sender_email: str) -> Dict[str, Any]:
        """
        Runs the full AI analysis on a single email. 
        Returns classification, summary, simple explanations (EN/HI), deadlines, and action items in one shot.
        """
        if not self.client:
            return self._mock_email_analysis(subject, body, sender_name)

        system_prompt = (
            "You are an expert email analyst. Analyze the email and return a JSON object with the following schema:\n"
            "{\n"
            "  \"category\": \"string (one of: important, work, personal, finance, education, social, promotions, security, invoice, meeting, spam, other)\",\n"
            "  \"urgency_score\": 0.85, # float between 0.0 and 1.0\n"
            "  \"importance_score\": 0.90, # float between 0.0 and 1.0\n"
            "  \"needs_reply\": true, # boolean indicating if the recipient should reply\n"
            "  \"summary\": \"Brief 1-2 sentence summary of the email\",\n"
            "  \"simple_explanation_en\": \"Beginner-friendly, jargon-free English explanation of the email (2-3 sentences)\",\n"
            "  \"simple_explanation_hi\": \"Beginner-friendly, simple Hindi (written in Devanagari script) explanation of the email (2-3 sentences)\",\n"
            "  \"action_items\": [\"list of clear executable tasks/actions for the recipient\"],\n"
            "  \"deadlines\": [{\"task\": \"task description\", \"deadline\": \"ISO timestamp if explicitly mentioned, or null\"}],\n"
            "  \"entities\": {\n"
            "    \"people\": [\"extracted names of people\"],\n"
            "    \"companies\": [\"extracted company names\"],\n"
            "    \"dates\": [\"extracted date strings\"],\n"
            "    \"amounts\": [\"extracted monetary values, e.g., $100\"] \n"
            "  }\n"
            "}\n"
            "Be highly precise. The Hindi explanation must be easy-to-understand standard Hindi."
        )

        user_prompt = f"From: {sender_name} <{sender_email}>\nSubject: {subject}\nBody:\n{body[:4000]}"

        try:
            res_str = await self._call_llm(system_prompt, user_prompt, json_response=True)
            return json.loads(res_str)
        except Exception as e:
            logger.error(f"Error calling OpenAI analyze_email: {e}")
            return self._mock_email_analysis(subject, body, sender_name)

    async def parse_voice_command(self, transcript: str) -> Dict[str, Any]:
        """
        Parses a voice command transcript into structured search filters.
        """
        if not self.client:
            return self._mock_voice_parse(transcript)

        now_str = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
        system_prompt = (
            f"You are a voice command natural language parser. Today's datetime is {now_str}.\n"
            "Analyze the transcript and return a JSON object with the following schema:\n"
            "{\n"
            "  \"intent\": \"search\",\n"
            "  \"filters\": {\n"
            "    \"from_sender\": \"string or null (sender email or name)\",\n"
            "    \"keyword\": \"string or null (general search terms or topic)\",\n"
            "    \"category\": \"string or null (one of: important, work, personal, finance, education, social, promotions, security, invoice, meeting, spam, other)\",\n"
            "    \"date_range\": {\n"
            "      \"start\": \"ISO timestamp or null\",\n"
            "      \"end\": \"ISO timestamp or null\"\n"
            "    },\n"
            "    \"is_unread\": \"boolean or null\",\n"
            "    \"needs_reply\": \"boolean or null\",\n"
            "    \"urgency_min\": \"float or null (0.0 to 1.0)\",\n"
            "    \"limit\": 20\n"
            "  },\n"
            "  \"original_query\": \"the transcript text\"\n"
            "}\n"
            "Only return valid JSON matching the schema."
        )

        try:
            res_str = await self._call_llm(system_prompt, f"Transcript: \"{transcript}\"", json_response=True)
            return json.loads(res_str)
        except Exception as e:
            logger.error(f"Error calling OpenAI parse_voice_command: {e}")
            return self._mock_voice_parse(transcript)

    async def suggest_reply(self, subject: str, body: str, sender_name: str, language: str = "en") -> List[str]:
        """
        Generates 3 short, professional reply suggestions.
        """
        if not self.client:
            return self._mock_reply_suggestions(language)

        lang_instruction = "in simple, helpful Hindi" if language == "hi" else "in professional, concise English"
        system_prompt = (
            f"You are an assistant suggesting email replies. Generate exactly 3 different, short reply suggestions "
            f"{lang_instruction}.\n"
            "Return them as a JSON list of strings, for example: [\"Option 1\", \"Option 2\", \"Option 3\"].\n"
            "Keep replies professional, brief (1-3 sentences), and contextually appropriate."
        )

        user_prompt = f"Original Email - From: {sender_name}, Subject: {subject}\nBody:\n{body[:2000]}"
        
        try:
            res_str = await self._call_llm(system_prompt, user_prompt, json_response=True)
            return json.loads(res_str)
        except Exception as e:
            logger.error(f"Error calling OpenAI suggest_reply: {e}")
            return self._mock_reply_suggestions(language)

    async def generate_daily_insights(self, email_stats: Dict[str, Any]) -> str:
        """
        Generates a summary of daily email insights.
        """
        if not self.client:
            return f"You received {email_stats.get('total_count', 0)} emails. " \
                   f"{email_stats.get('urgent_count', 0)} are urgent and " \
                   f"{email_stats.get('needs_reply_count', 0)} need your response."

        system_prompt = (
            "You are an inbox assistant. Generate a friendly, engaging daily executive summary of the inbox statistics. "
            "Explain highlights, key categories, and general advice (2-3 sentences max)."
        )
        
        user_prompt = f"Stats: {json.dumps(email_stats)}"
        try:
            return await self._call_llm(system_prompt, user_prompt, json_response=False)
        except Exception as e:
            logger.error(f"Error calling OpenAI generate_daily_insights: {e}")
            return f"You received {email_stats.get('total_count', 0)} emails today."

    # --- Fallback / Mock implementations ---

    def _mock_email_analysis(self, subject: str, body: str, sender: str) -> Dict[str, Any]:
        text = f"{subject} {body}".lower()
        
        # Rule-based classification
        category = "personal"
        urgency = 0.1
        importance = 0.2
        needs_reply = False
        action_items = []
        deadlines = []
        
        if "invoice" in text or "bill" in text or "payment" in text or "amount due" in text:
            category = "invoice"
            urgency = 0.8
            importance = 0.9
            needs_reply = True
            action_items.append("Review the invoice details and complete payment.")
            deadlines.append({"task": "Invoice Payment", "deadline": datetime.utcnow().strftime("%Y-%m-%dT17:00:00Z")})
        elif "meeting" in text or "calendar" in text or "zoom" in text or "schedule" in text:
            category = "meeting"
            urgency = 0.7
            importance = 0.8
            action_items.append("Add the meeting to your calendar.")
        elif "exam" in text or "homework" in text or "college" in text or "assignment" in text or "course" in text:
            category = "education"
            urgency = 0.6
            importance = 0.7
            if "submit" in text or "due" in text:
                needs_reply = True
                action_items.append("Submit the assignment before the due date.")
        elif "security" in text or "login" in text or "password" in text or "alert" in text:
            category = "security"
            urgency = 0.95
            importance = 0.95
            action_items.append("Verify this security alert and secure your account if necessary.")
        elif "job" in text or "work" in text or "project" in text or "contract" in text:
            category = "work"
            urgency = 0.5
            importance = 0.7
        elif "promo" in text or "offer" in text or "discount" in text or "sale" in text:
            category = "promotions"
            urgency = 0.05
            importance = 0.1

        # Adjust score if sender looks important
        if "boss" in text or "manager" in text or "urgent" in text:
            urgency = max(urgency, 0.8)
            importance = max(importance, 0.9)
            needs_reply = True

        return {
            "category": category,
            "urgency_score": urgency,
            "importance_score": importance,
            "needs_reply": needs_reply,
            "summary": f"This is a {category} email regarding '{subject}'.",
            "simple_explanation_en": f"You received a message from {sender} about '{subject}'. It is classified as {category} and needs attention.",
            "simple_explanation_hi": f"आपको {sender} से '{subject}' के बारे में एक ईमेल मिला है। यह {category} श्रेणी में आता है।",
            "action_items": action_items or ["No immediate actions required."],
            "deadlines": deadlines,
            "entities": {
                "people": [sender],
                "companies": [sender.split("@")[-1].split(".")[0]] if "@" in sender else [],
                "dates": [],
                "amounts": []
            }
        }

    def _mock_voice_parse(self, transcript: str) -> Dict[str, Any]:
        text = transcript.lower()
        category = None
        is_unread = None
        keyword = None
        
        # Simple keywords
        for cat in ["important", "work", "personal", "finance", "education", "social", "promotions", "security", "invoice", "meeting"]:
            if cat in text:
                category = cat
                
        if "unread" in text:
            is_unread = True
        elif "read" in text:
            is_unread = False

        # Extract keyword
        words = text.split()
        if "about" in words:
            idx = words.index("about")
            if idx + 1 < len(words):
                keyword = " ".join(words[idx+1:])
        elif "find" in words:
            idx = words.index("find")
            if idx + 1 < len(words):
                keyword = " ".join(words[idx+1:])
        elif "show" in words:
            # check if there's keyword after
            pass

        return {
            "intent": "search",
            "filters": {
                "from_sender": None,
                "keyword": keyword,
                "category": category,
                "date_range": {
                    "start": None,
                    "end": None
                },
                "is_unread": is_unread,
                "needs_reply": True if "reply" in text else None,
                "urgency_min": 0.7 if "urgent" in text else None,
                "limit": 20
            },
            "original_query": transcript
        }

    def _mock_reply_suggestions(self, language: str) -> List[str]:
        if language == "hi":
            return [
                "नमस्ते, मुझे आपका ईमेल मिल गया है। मैं जल्द ही इसका उत्तर दूँगा।",
                "धन्यवाद, मैंने जानकारी नोट कर ली है।",
                "क्या हम इस बारे में कल बात कर सकते हैं?"
            ]
        return [
            "Hi, thanks for the update. I will review this and get back to you shortly.",
            "Understood, thank you. I've noted the details.",
            "Can we schedule a call to discuss this further?"
        ]

ai_service = AIService()
