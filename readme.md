
---

# 🚕 **Uber-Style Matching Service – Flow Documentation**

**Simple Hinglish Explanation**

---

## 📌 Overview

Matching Service ka kaam hai **Rider ke paas kaun sa nearest available Driver hai** woh dhoondna — fast & accurate.

Ye document Matching Service ka **step-by-step flow**, **Redis usage**, **Kafka events**, aur **driver selection logic** explain karta hai.

---

## 🧠 High-Level Flow

Below is the complete Matching flow:

1. **Rider ride maangta hai**
2. **Matching Service ko request milti hai**
3. **Redis se near drivers nikalta hai**
4. **Free drivers filter karta hai**
5. **Best driver choose karta hai**
6. **Driver ko lock karta hai**
7. **Driver ko ride offer bhejta hai**
8. **Driver accept / reject karta hai**

Bas itna hi — yahi hai Matching Service ka core logic.

---

## 🔄 Step-by-Step Detailed Flow (Hinglish)

---

### **1️⃣ Rider ride maangta hai**

Rider app ek request bhejta hai with:

* `lat`
* `lng`
* `rider_id`

Ye Kafka ke topic `ride.request` me publish hota hai.

**Example message:**

```json
{
  "rider_id": 101,
  "lat": 28.6510,
  "lng": 77.2350
}
```

---

### **2️⃣ Matching Service ko request milti hai**

Matching Service Kafka se ye message consume karta hai.

Phir woh immediately **driver search** shuru kar deta hai.

---

### **3️⃣ Redis se near drivers nikalta hai**

Redis GEO ek ultra-fast map jaisa hota hai.

Matching Service bolta hai:

> “Is rider location ke 3 km andar kaun drivers available hain? Top 10 de do.”

**Redis Query (example):**

```
GEOSEARCH drivers
FROMLONLAT 77.2350 28.6510
BYRADIUS 3000 m
WITHDIST
COUNT 10
ASC
```

**Redis returns something like:**

| Driver  | Distance |
| ------- | -------- |
| driver1 | 520 m    |
| driver2 | 900 m    |
| driver3 | 1200 m   |

---

### **4️⃣ Free drivers filter karta hai**

Ab Matching Service check karta hai:

* driver busy hai?
* offline hai?
* kisi aur ride pe processing me hai?

Agar driver busy ho → drop
Agar driver free ho → keep

Finally bache: free + nearest drivers.

---

### **5️⃣ Best driver choose karta hai**

Ab scoring hoti hai:

* nearest distance
* ETA
* rating (optional)
* acceptance rate (optional)

Akhir me **best driver** select hota hai.

Example: **driver2 is final chosen driver**

---

### **6️⃣ Driver ko lock karta hai (reservation)**

Taaki dusra rider ye driver na le sake.

Redis me reservation key set karte hain:

```
SETNX driver_lock:driver2 rider101
EXPIRE driver_lock:driver2 15
```

Driver ko 15 seconds ka time milta hai respond karne ka.

Agar driver slow ho → lock expire → next driver try.

---

### **7️⃣ Driver ko ride offer bhejta hai**

Ab Matching Service Kafka par send karta hai:

Topic: `ride.match.found`

```json
{
  "driver_id": 2,
  "rider_id": 101,
  "eta": 4
}
```

Driver app me popup aata hai:

> "New Ride Request. Accept?"

---

### **8️⃣ Driver accept / reject karta hai**

Driver do kaam kar sakta hai:

### ✔ Accept

तो Matching Service

* `ride.match.confirmed` publish karta hai
* reservation lock hata deta hai
* Trip Service start hota hai

### ❌ Reject

तो Matching Service

* lock release karta hai
* next best driver choose karta hai
* agar koi driver nahi ho → “No drivers available"

---

## 🗺 Simple ASCII Diagram

```
Rider App → ride.request → Kafka → Matching Service
                    ↓
                Redis GEO
                    ↓
           Nearest Drivers Found
                    ↓
           Filter Available Drivers
                    ↓
              Choose Best Driver
                    ↓
            Lock Driver (Redis)
                    ↓
       Send ride.match.found to Driver
                    ↓
       Driver Accept / Reject → Kafka
```

---

## 🧩 Why This Works (Hinglish)

* Redis GEO → super fast nearest driver search
* Kafka → reliable event pipeline
* Locking → avoids double booking drivers
* Filtering → ensures only free drivers selected
* Matching → improves rider wait time

---

## 📁 What You Can Add Next

* ETA calculation using matrix API
* Surge pricing logic
* Multi-driver retry flow
* Driver timeout logic

---

