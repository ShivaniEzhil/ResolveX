import json

from google import genai

from app.core.config import settings
from app.schemas.ai import ComplaintAIAnalysis


client = genai.Client(
    api_key=settings.gemini_api_key
)


def analyze_complaint(
    title: str,
    description: str,
    location: str,
) -> ComplaintAIAnalysis:

    prompt = f"""
You are an AI complaint classification system for ResolveX,
a college complaint management platform.

Analyze the following complaint.

Title:
{title}

Description:
{description}

Location:
{location}

Choose exactly ONE value from each allowed list.

Allowed categories:
ACADEMIC
HOSTEL
TRANSPORT
NETWORK
ELECTRICAL
CLEANLINESS
SECURITY
FACILITIES
TECHNICAL
OTHER

Allowed priorities:
LOW
MEDIUM
HIGH
CRITICAL

Allowed departments:
ACADEMICS
HOSTEL
TRANSPORT
IT
ELECTRICAL
MAINTENANCE
SECURITY
ADMINISTRATION

Classification guidelines:

- NETWORK:
  Wi-Fi, internet, LAN, connectivity, network access.

- ELECTRICAL:
  Power failure, lights, switches, electrical wiring.

- HOSTEL:
  Hostel rooms, hostel facilities, mess, accommodation.

- TRANSPORT:
  Buses, routes, transportation, bus timing.

- ACADEMIC:
  Classes, exams, faculty, courses, academic facilities.

- SECURITY:
  Theft, unauthorized access, safety or security incidents.

- CLEANLINESS:
  Garbage, sanitation, hygiene, cleaning.

- FACILITIES:
  Furniture, classrooms, buildings, common facilities.

- TECHNICAL:
  Projectors, computers, printers, software or other technical equipment
  that is not primarily a network issue.

- OTHER:
  Use only when the complaint does not reasonably fit another category.

Priority guidelines:

- CRITICAL:
  Immediate danger, major safety/security incident, severe outage
  affecting a large part of the institution.

- HIGH:
  Significant issue affecting multiple users or an important service.

- MEDIUM:
  Normal service disruption affecting a limited area or group.

- LOW:
  Minor inconvenience or non-urgent request.

Department must correspond to the category where reasonably possible.

Return ONLY valid JSON.

Do not return markdown.
Do not return ```json.
Do not add any explanation outside the JSON.

Expected structure:

{{
    "category": "NETWORK",
    "priority": "MEDIUM",
    "department": "IT",
    "summary": "Short summary of the complaint",
    "reason": "Short explanation for the classification"
}}
"""

    response = client.models.generate_content(
        model="gemini-3.1-flash-lite",
        contents=prompt,
    )

    if not response.text:
        raise RuntimeError("Gemini returned an empty response")

    try:
        result = json.loads(response.text)
    except json.JSONDecodeError as exc:
        raise RuntimeError(
            "Gemini returned invalid JSON"
        ) from exc

    return ComplaintAIAnalysis.model_validate(result)