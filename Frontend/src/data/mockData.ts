import type { ComplaintItem, ComplaintResponseItem } from "../types/complaints";
import type { UserManagementItem } from "../types/users";
import type { NotificationItem } from "../types/notifications";
import type { AuditActivity } from "../types/analytics";

export const MOCK_COMPLAINTS: ComplaintItem[] = [
  {
    id: "CMP-1024",
    title: "Wi-Fi connectivity failure in Hostel Block B",
    description:
      "All access points on the 3rd floor of Block B are offline since 8 AM today. Over 120 students are unable to submit assignments or access course materials.",
    location: "Hostel Block B, Floor 3",
    category: "NETWORK",
    priority: "HIGH",
    department: "IT",
    status: "ASSIGNED",
    user_id: "usr-student-1",
    userName: "Rahul Sharma",
    userEmail: "rahul.s@college.edu",
    assigned_to: "usr-staff-1",
    assignedStaffName: "Vikram Malhotra (IT)",
    ai_summary:
      "High impact network outage affecting multiple users in Hostel Block B.",
    ai_reason:
      "Mentions Wi-Fi failure and assignment submission issues affecting 120+ students.",
    created_at: "2026-08-13T08:30:00Z",
    updated_at: "2026-08-13T09:00:00Z",
  },
  {
    id: "CMP-1025",
    title: "Main Auditorium AC cooling failure during seminar",
    description:
      "The central air conditioning system in the main auditorium is making loud buzzing noises and not cooling the hall properly.",
    location: "Main Auditorium",
    category: "ELECTRICAL",
    priority: "CRITICAL",
    department: "ELECTRICAL",
    status: "IN_PROGRESS",
    user_id: "usr-student-2",
    userName: "Ananya Roy",
    userEmail: "ananya.r@college.edu",
    assigned_to: "usr-staff-2",
    assignedStaffName: "Suresh Kumar (Electrical)",
    ai_summary:
      "Critical cooling system breakdown in high-capacity public venue.",
    ai_reason:
      "Disrupts active events and presents potential compressor electrical fault.",
    created_at: "2026-08-13T09:15:00Z",
    updated_at: "2026-08-13T09:45:00Z",
  },
  {
    id: "CMP-1026",
    title: "Water leak near Chemistry Lab 204",
    description:
      "Pipe leakage detected near the entrance of Chemistry Lab 204. Water pooling near electrical outlets.",
    location: "Science Block, Lab 204",
    category: "FACILITIES",
    priority: "HIGH",
    department: "MAINTENANCE",
    status: "RESOLVED",
    user_id: "usr-student-3",
    userName: "Priya Patel",
    userEmail: "priya.p@college.edu",
    assigned_to: "usr-staff-3",
    assignedStaffName: "Ramesh Singh (Maintenance)",
    ai_summary: "Facility water pipe leak creating safety hazard near lab.",
    ai_reason: "Water near electrical outlets poses immediate hazard.",
    created_at: "2026-08-12T14:20:00Z",
    updated_at: "2026-08-12T17:10:00Z",
  },
  {
    id: "CMP-1027",
    title: "Projector lamp blown in Room 302",
    description:
      "The ceiling-mounted projector in Lecture Hall 302 turns off automatically after 2 minutes with a red lamp error indicator.",
    location: "Academic Block, Room 302",
    category: "TECHNICAL",
    priority: "MEDIUM",
    department: "IT",
    status: "SUBMITTED",
    user_id: "usr-student-4",
    userName: "Arjun Verma",
    userEmail: "arjun.v@college.edu",
    ai_summary: "Technical hardware fault with classroom projector lamp.",
    ai_reason: "Affects single classroom lectures, non-hazardous.",
    created_at: "2026-08-13T10:05:00Z",
    updated_at: "2026-08-13T10:05:00Z",
  },
  {
    id: "CMP-1028",
    title: "Bus Route #4 delayed repeatedly without notice",
    description:
      "College bus route #4 running 40 minutes late for the past 3 consecutive days causing missed morning classes.",
    location: "Bus Stop 12 (North Campus)",
    category: "TRANSPORT",
    priority: "MEDIUM",
    department: "TRANSPORT",
    status: "ASSIGNED",
    user_id: "usr-student-5",
    userName: "Neha Gupta",
    userEmail: "neha.g@college.edu",
    assigned_to: "usr-staff-4",
    assignedStaffName: "Mahesh Babu (Transport)",
    ai_summary: "Recurring transport schedule delay impacting commuters.",
    ai_reason: "Service timing issue affecting morning schedule.",
    created_at: "2026-08-13T07:45:00Z",
    updated_at: "2026-08-13T08:15:00Z",
  },
];

export const MOCK_RESPONSES: Record<string, ComplaintResponseItem[]> = {
  "CMP-1024": [
    {
      id: "resp-1",
      complaint_id: "CMP-1024",
      user_id: "usr-staff-1",
      userName: "Vikram Malhotra",
      userRole: "STAFF",
      message:
        "Inspected the 3rd floor switch. Main fiber link is active, but sub-switch #3 blew a fuse. Replacing the switch module now.",
      created_at: "2026-08-13T09:15:00Z",
    },
  ],
  "CMP-1025": [
    {
      id: "resp-2",
      complaint_id: "CMP-1025",
      user_id: "usr-staff-2",
      userName: "Suresh Kumar",
      userRole: "STAFF",
      message:
        "Technician on site. Refilling refrigerant gas and replacing worn fan belt.",
      created_at: "2026-08-13T10:00:00Z",
    },
  ],
};

export const MOCK_USERS: UserManagementItem[] = [
  {
    id: "usr-1",
    name: "Admin User",
    email: "admin@resolvex.edu",
    role: "ADMIN",
    is_active: true,
    created_at: "2026-01-10T10:00:00Z",
  },
  {
    id: "usr-staff-1",
    name: "Vikram Malhotra",
    email: "vikram.m@resolvex.edu",
    role: "STAFF",
    department: "IT",
    is_active: true,
    created_at: "2026-02-01T11:00:00Z",
  },
  {
    id: "usr-staff-2",
    name: "Suresh Kumar",
    email: "suresh.k@resolvex.edu",
    role: "STAFF",
    department: "ELECTRICAL",
    is_active: true,
    created_at: "2026-02-05T09:30:00Z",
  },
  {
    id: "usr-staff-3",
    name: "Ramesh Singh",
    email: "ramesh.s@resolvex.edu",
    role: "STAFF",
    department: "MAINTENANCE",
    is_active: true,
    created_at: "2026-02-12T14:00:00Z",
  },
  {
    id: "usr-staff-4",
    name: "Mahesh Babu",
    email: "mahesh.b@resolvex.edu",
    role: "STAFF",
    department: "TRANSPORT",
    is_active: true,
    created_at: "2026-03-01T08:00:00Z",
  },
  {
    id: "usr-student-1",
    name: "Rahul Sharma",
    email: "rahul.s@college.edu",
    role: "STUDENT",
    is_active: true,
    created_at: "2026-08-01T12:00:00Z",
  },
  {
    id: "usr-student-2",
    name: "Ananya Roy",
    email: "ananya.r@college.edu",
    role: "STUDENT",
    is_active: true,
    created_at: "2026-08-02T15:30:00Z",
  },
];

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    user_id: "usr-1",
    complaint_id: "CMP-1025",
    title: "Critical Complaint Alert",
    message: "New CRITICAL complaint submitted: Main Auditorium AC cooling failure",
    type: "COMPLAINT_STATUS",
    is_read: false,
    created_at: "2026-08-13T09:15:00Z",
  },
  {
    id: "notif-2",
    user_id: "usr-1",
    complaint_id: "CMP-1024",
    title: "Complaint Auto-Assigned",
    message: "CMP-1024 Wi-Fi outage assigned to Vikram Malhotra (IT)",
    type: "COMPLAINT_ASSIGNED",
    is_read: false,
    created_at: "2026-08-13T08:35:00Z",
  },
  {
    id: "notif-3",
    user_id: "usr-1",
    complaint_id: "CMP-1026",
    title: "Complaint Resolved",
    message: "CMP-1026 Water leak near Chemistry Lab marked RESOLVED by Ramesh Singh",
    type: "COMPLAINT_STATUS",
    is_read: true,
    created_at: "2026-08-12T17:10:00Z",
  },
];

export const MOCK_AUDIT_LOGS: AuditActivity[] = [
  {
    id: "aud-1",
    user_id: "usr-student-1",
    complaint_id: "CMP-1024",
    action: "COMPLAINT_CREATED",
    description: "Complaint CMP-1024 created by Rahul Sharma",
    created_at: "2026-08-13T08:30:00Z",
  },
  {
    id: "aud-2",
    complaint_id: "CMP-1024",
    action: "COMPLAINT_ASSIGNED",
    description: "Complaint automatically assigned to Vikram Malhotra (IT department)",
    metadata: { assigned_to: "usr-staff-1", assignment_type: "AUTOMATIC" },
    created_at: "2026-08-13T08:35:00Z",
  },
  {
    id: "aud-3",
    user_id: "usr-staff-1",
    complaint_id: "CMP-1024",
    action: "RESPONSE_ADDED",
    description: "Staff added response: Inspected switch module...",
    created_at: "2026-08-13T09:15:00Z",
  },
];
