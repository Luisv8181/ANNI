"""Stand-in Ollama for the full pipeline simulation.

Serves both roles the app asks of a local model:
  - annotation assist  (request has "format": "json")  -> trait suggestion JSON
  - synthetic patient  (role-play system prompt)       -> scripted turns + state tag
"""
from http.server import BaseHTTPRequestHandler, HTTPServer
import json

ASSIST_MAP = [
    (["bother", "probably nothing", "didn't want to"], "emotion-hesitation", 84,
     "Minimises the symptom and avoids raising it — classic reluctance to disclose."),
    (["sister", "family", "drove me", "sat with"], "support-family", 90,
     "A family member provides logistical and emotional support around care."),
    (["pamphlet", "another language", "dosage", "understand"], "literacy-medical", 88,
     "Describes not understanding written medical instructions."),
    (["referral", "stopped believing", "clinic", "mixed up"], "healthcare-trust", 86,
     "Loss of confidence in the system after an administrative failure."),
    (["decide", "my own treatment", "the one who"], "goals-autonomy", 85,
     "States a desire to control their own care decisions."),
]

PATIENT_TURNS = [
    ("Hi... sorry if this is a weird thing to message about. Work has been a lot lately and I can't seem to switch off.", 42, 25),
    ("It's mostly at night. I lie there going over everything I might have gotten wrong that day. My sister says I should talk to someone, so... here I am, I guess.", 50, 38),
    ("I did see a doctor once. They gave me a pamphlet and a prescription and I honestly couldn't follow half of it. I didn't go back.", 58, 47),
    ("Maybe. I don't know. After they lost my referral I sort of stopped trusting the whole thing. It's easier to just handle it myself.", 66, 44),
    ("That's kind of you to say. I just want to be the one deciding what happens next, you know? Not another form, not another waiting list.", 61, 55),
]
state = {"i": 0}


class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        req = json.loads(self.rfile.read(int(self.headers["Content-Length"])))
        if req.get("format") == "json":
            user = next((m["content"] for m in req["messages"] if m["role"] == "user"), "")
            quote = user.split("Highlighted quote:")[-1].lower()
            best = None
            for keys, node, conf, why in ASSIST_MAP:
                hits = sum(1 for k in keys if k in quote)
                if hits and (best is None or hits > best[0]):
                    best = (hits, node, conf, why)
            if best:
                content = json.dumps({"ontology_node_id": best[1], "confidence": best[2], "rationale": best[3]})
            else:
                content = json.dumps({"ontology_node_id": "emotion-hesitation", "confidence": 55,
                                      "rationale": "Closest available trait for this span."})
        else:
            text, distress, disclosure = PATIENT_TURNS[state["i"] % len(PATIENT_TURNS)]
            state["i"] += 1
            content = f"{text}\n[[state distress={distress} disclosure={disclosure}]]"
        payload = json.dumps({"message": {"content": content}}).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def log_message(self, *args):
        pass


HTTPServer(("127.0.0.1", 11434), Handler).serve_forever()
