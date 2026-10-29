LabTrack
Computer Laboratory Equipment and Schedule Tracker

Group members
Micha Bermudo - SIA
Rainee Roh Rideout
Xian Xavier Tinio - DBMS
Antonia Marie Valencia
Jorgie Lou Venerable
Christian Harvey Vincoy

Scope and planned features
1. User and Access Management
- Register or create user accounts, depending on the final authentication design.
- Sign in and sign out.
- Apply role-based permissions to restricted features.
- View relevant user records where permitted.
2. Laboratory Management
- Add, view, edit, and remove laboratory records when permitted.
- Store laboratory name, location, capacity, type, and status.
- Identify laboratories that are unavailable or under maintenance.
3. Booking and Schedule Management
- Create and view laboratory booking requests.
- Store the requested date, start time, end time, requester, and booking status.
- Review and update booking requests according to the agreed workflow.
- Check for overlapping bookings before accepting a reservation.
4. Equipment Inventory
- Record equipment name, category, identifier, condition, and status.
- Track equipment assignments to laboratories.
- Identify equipment that is unavailable, damaged, or under maintenance.
5. Maintenance Management
- Record maintenance requests and their reported problems.
- Track maintenance status and maintenance history.
- Link maintenance records to the affected equipment.
6. Reports and Dashboard
- Display useful summaries of laboratories, bookings, equipment, and maintenance.
- Use SQL joins to show related records in one report.
- Display detected schedule conflicts and unavailable resources.

Major Feature:
Schedule conflict and equipment availability checker

Database = MySQL
Backend = Node.js
Webframework = Express.js
Frontend = HTML, CSS, JavaScript
API = Rest API and JSON
//subject to change

Jorgie 
- User and access management
- users, roles, audit_logs
- accounts, permissions, and important activity history

Tonia 
- Laboratory management
- laboratories, lab_types, lab_statuses
- Lavoratory details and lookup values

Rain 
- Booking and scheduling 
- bookingss, schedules, booking_statuses
- booking requests, time slots, and booking states

Harvey
- Equipment inventory
-equipment. equipment_categories, equipment_assignments
- equipment details, categories, and laboratory assignments

Xian
- maintenance
- maintenance_requests, maintenance_records, maintainance_statuses
- report issues, maintainance work, and status values

Micha 
- conflict and reporting support 
- departments, courses, conflict_logs, notifications
- organizational/course details, conflict outcomes, and notifications

Rules for Repository
- Keep main in a working state.
- Do not commit directly to main unless the instructor specifically directs the team to do so.
- Use feature branches and pull requests for changes.
- Make regular, meaningful commits that reflect your own work.
- Follow the instructor's required merge method and contribution-history rules.
- Do not share GitHub passwords or personal access tokens.
- Discuss schema and API changes with affected members before merging.
- Every member should be able to explain the code and design decisions they contributed.

DO NOT FORGET!
- Pull or fetch the latest repository changes before starting work.
- Create a feature branch for a focused task.
- Make and test the changes locally.
- Commit meaningful work under the member's own GitHub account.
- Push the branch and open a pull request.
- Request a review from a teammate and address feedback.
- Merge the reviewed pull request into main using the merge method required by the sir.
- Update documentation when a feature, database field, route, or setup step changes.

Setup Instructions
Prerequisite
- Node.js and npm
- MySQL Server
- MySQL Workbench (recommended)
- Git

1. Clone the repository
git clone https://github.com/Jjorgielou/LabTrack.git
cd LabTrack

2. Create the database
Open MySQL Workbench and execute the SQL script in:
`database/schema.sql`

maggama nig initial database tables for user and access management.
To insert the example roles and users, execute:
`database/sample-data.sql`
Only run the sample-data script kung ang sample records have not already been inserted.

3. Configure environment variables
Inside the `backend` folder, create a `.env` file containing your own local MySQL credentials:
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_local_mysql_password
DB_NAME=labtrack_db

Use the variable names expected by `backend/config/db.js`. If the existing configuration uses different names, update this example to match it.

AYAW I COMMIT ANG  `.env` KAY NAA DIHA ANG PASSWORD NIMO SA DATABASE!

4. Install backend dependencies
From the project root, run:
cd backend
npm install

5. Start the backend
npm run dev
The server should start on `http://localhost:3000`, unless another port is configured.

6. Test the API
Open these endpoints in a browser:
- `http://localhost:3000/` — checks whether the backend is running.
- `http://localhost:3000/api/health/db` — checks the MySQL connection.