Task Management System:

Guard
Fields: name, profile, email, password, phone, availability (mon–sun), employmentType (fullTime/partTime), maxHoursPerWeek

Company
Fields: name, profile, email, password, phone, media (multiple files)

Client
Fields: name, profile, email, password, phone

Note: Guard and Client are registered under a Company.
Email must be unique per company (same email can be reused in a different company).

Modules
Shift
Fields: shiftName, startDate, endDate, startTime, endTime, location, media (multiple files)


Task
Fields: taskName, startDate, startTime, endTime, subTasks (array with status pending/completed), mainTaskStatus (auto-completed when all subTasks are completed), task is under the shift

Tour
Fields: tourName, startDate, endDate

You need to assign shifts, tasks, and tours to a guard, and you must validate while assigning.