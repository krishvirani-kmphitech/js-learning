Task - Flight Booking System

Scenario
You are building a flight booking system. Each flight is created by a pilot and has a limited number of seats. Travellers can book seats, pay upfront, and receive refunds if the actual per-person cost changes once the flight is completed.

Create are two user flows:
Pilot:- name, email, location, gender, dob, radius - Can create (add) flights
Traveller:- name, email, location, gender, dob, radius  - Can browse flights, view details, and book seats, cancel booking

Pilot Flow – Add Flight
A pilot can add a flight with the following fields:
Flight Name
Start Time & End Time
Location
Seating Capacity (includes 1 pilot seat)
Example: Entered Capacity = 4 → consider 1 pilot + 3 traveller seats
Total Flight Cost

Traveller Flow - Flight Details

1. Show the list of all upcoming flights within the user's radius. 

2. Flight Details - 
From a traveller’s perspective, show the following:
Flight Name
Start Time & End Time
Traveller Seats Only (capacity -(minus) 1 pilot seat)
Booked Seats and Remaining Seats with price 
Book 1 Seat 
Price: XX

Book 2 Seat 
Price: XX
Calculation Example 
Total Flight Cost: $400
Total Seats: 4
1 Pilot
3Travellers (Traveller A & B & C)
Total Seats = 4 → Each person's share will be $100 when the flight is completed. If only two travellers fly, then each person's share will be $133.33.  If only one travellers fly, then each person's share will be $200.

Booking Rules
In every situation, the total flight cost must always be shared equally among the pilot and the booked passengers. No matter the case, whether a passenger books a seat and then cancels, or only some of the available traveller seats are booked, the cost should always be distributed equally among those who finally take the flight.

Purpose of the refund
Refunds are required because travellers pay upfront when booking, but the actual per-person cost can only be finalized once all seats are booked, this ensures fairness so that early bookers don’t overpay compared to later ones.
NOTE: 
The flight will be completed when the end time has passed.)
The pilot’s seat is always counted in the total cost split, but the pilot does not make any payment through the system. Since the pilot is the owner of the flight, their share is implicit. The app only collects payments from travellers, and refunds (if applicable) are also handled only among travellers.


Deliver a solution that is:
Dynamic (not hardcoded to specific numbers)
Clear in logic
Handles all edge cases


NOTE: Do not use any AI tools like chatGPT, Deepseek, cursor. System is recording your whole interview and please do not close or restart computer.