export interface UserRole {
    super_admin: "SUPER_ADMIN",
    admin: "ADMIN",
    doctor: "DOCTOR",
    patient: "PATIENT"
}

export interface UserStatus {
    blocked: "BLOCKED",
    deleted: "DELETED",
    active: "ACTIVE"
}