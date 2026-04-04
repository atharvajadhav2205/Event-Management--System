<div align="center">
  <img src="https://ik.imagekit.io/ns4gfx2mi/Mini%20Project/logo.png" alt="EventHub Logo" width="150" />
  <br/>
  <a href="https://git.io/typing-svg">
    <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&weight=600&size=35&pause=1000&color=3B82F6&center=true&vCenter=true&width=800&lines=EventHub%3A+The+Event+Management+System;Simplify+College+Event+Planning;Automate+Ticketing+%26+Attendance" alt="Typing SVG" />
  </a>
</div>

EventHub is a web-based platform designed to simplify the planning and management of college events. Built to replace traditional manual processes involving spreadsheets and forms, it provides a centralized space where administrators can organize activities efficiently and students can seamlessly browse and register online. 

## 🌟 Key Features

* **Centralized Dashboard:** A unified digital space for users to discover upcoming seminars, workshops, and cultural events, and register online.
* **Role-Based Access Control:** Secure authentication system using JWT to protect user and admin routes.
* **QR-Based Smart Attendance:** Automatically generates a QR-based ticket upon registration, allowing organizers to mark attendance quickly by scanning it at the venue.
* **Automated Certificate Generation:** Allows organizers to upload certificate templates (via Cloudinary) and automatically generate them for attendees by dynamically adjusting participant names and fonts.
* **Real-Time Announcements:** Keeps students informed about important updates, schedules, and deadlines to close the communication gap.

## 💻 Tech Stack

### Frontend
<img src="https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB" alt="React"/> <img src="https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E" alt="JavaScript"/> <img src="https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS"/>
* Builds a responsive and interactive user interface for both users and admins.

### Backend
<img src="https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js"/> <img src="https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB" alt="Express.js"/>
* Handles server logic, APIs, data processing, and routing.

### Database
<img src="https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB"/>
* Stores user details, event information, registrations, and transactions.

### Tools & Third-Party Services
<img src="https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens" alt="JWT"/> <img src="https://img.shields.io/badge/Cloudinary-%233448C5.svg?style=for-the-badge&logo=cloudinary&logoColor=white" alt="Cloudinary"/> 
* **Authentication:** JWT
* **Image & Template Storage:** Cloudinary
* **PDF & Graphics Processing:** Pdf-Kit, Sharp, SVG
* **QR functionality:** QR-Scanner & QR-Code

## ⚙️ Workflow

1. **Authentication:** Users and Admins create accounts and log in securely via JWT.
2. **Event Creation:** Organizers add event details, upload images, and set dates, venues, and ticket prices.
3. **Approval:** Admins verify and approve the event before it becomes visible to users.
4. **Registration:** Regular users search/filter events, fill out registration forms, and make payments (if required).
5. **Ticketing & Entry:** A QR Code/Digital Ticket is issued upon successful registration, which is later scanned to verify entry and mark attendance.

## 👥 Contributors
Developed as a Mini Project for the Department of Artificial Intelligence and Data Science at Datta Meghe College of Engineering, Airoli.

* **[Shivam Nilesh Awate](https://github.com/your-username)**
*  **[Harsh Viju Bhendarkar](https://github.com/Bharsh25)**
*  **[Soham Vijay Fegade](https://github.com/sohamfegade)**
*  **[Atharva Rajendra Jadhav](https://github.com/atharvajadhav2205)**
