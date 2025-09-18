# prediction.py

# Define simple compliance rules
RESTRICTED_LANDMARKS = ["school", "heritage", "coastal", "traffic_signal", "sharp_turn"]

MIN_DISTANCE = {
    "school": 100,
    "heritage": 200,
    "coastal": 50,
    "traffic_signal": 30,
    "sharp_turn": 50
}

MAX_AREA = 200  


def check_compliance(data):
    # Extract input safely
    landmark = data.get("nearby_landmark", "").lower()
    distance = float(data.get("distance_from_road", 0))
    landmark_distance = float(data.get("landmark_distance", 0))
    content = data.get("content_category", "").lower()
    width = float(data.get("width", 0))
    height = float(data.get("height", 0))
    area = width * height

    # Rule 0: too far from road
    if distance > 25:
        return {
            "success": False,
            "allowed": False,
            "reason": f"Billboard too far from road (distance {distance} < 25 meters)"
        }

    # Rule 1: restricted landmarks
    if landmark in RESTRICTED_LANDMARKS:
        min_dist = MIN_DISTANCE.get(landmark, 0)
        if landmark_distance < min_dist:
            return {
                "success": False,
                "allowed": False,
                "reason": f"Too close to {landmark} (distance {landmark_distance} < min {min_dist} meters)"
            }

    g=[
        "race","bad", "religion", "politics", "violence", "profanity", "slurs", "sexually explicit",
        "drugs", "alcohol", "tobacco", "illegal", "hate", "misleading", "sensitive",

        # Profanity
        "fuck", "shit", "bitch", "asshole", "bastard", "dick", "cunt",

        # Slurs / Derogatory
        "nigger", "chink", "paki", "kike", "faggot", "tranny", "retard",

        # Sexually explicit / obscene
        "porn", "xxx", "sex", "nude", "prostitute", "escort", "slut", "whore",
        "erotic", "fetish", "hardcore", "bdsm",

        # Drugs / Alcohol / Tobacco
        "weed", "marijuana", "cannabis", "coke", "cocaine", "heroin", "meth", "lsd", "ecstasy",
        "vodka", "whiskey", "rum", "beer", "wine", "brandy",
        "cigarette", "cigar", "tobacco", "hookah", "chew",

        # Violent / Illegal activities
        "terrorist", "terrorism", "bomb", "explosive", "gun", "rifle", "pistol", "knife",
        "kill", "murder", "shoot", "assassinate", "mafia", "gang",

        # Discriminatory / Hate
        "racist", "sexist", "casteist", "xenophobic", "islamophobic", "anti-semitic",

        # Misleading / False claims
        "100% cure", "miracle", "guaranteed result", "instant fix",

        # Sensitive categories
        "blasphemy", "god hate", "anti-religion", "political propaganda"
    ]
    if any(word in content for word in g):
        return {
            "success": False,
            "allowed": False,
            "reason": f"{content.capitalize()} ads not allowed near {landmark}"
        }

    # Rule 3: size restrictions
    if width > 20 or height > 10:
        return {
            "success": False,
            "allowed": False,
            "reason": f"Billboard dimensions exceed limits (width {width}m, height {height}m)"
        }

    # If all rules pass
    return {
        "success": True,
        "allowed": True,
        "reason": "Compliant with all rules"
    }
