export const users = [
    {
      id: 1,
      name: "Udval",
      email: "udval@example.com",
      role: "admin",
      password: "demo-password-1"
    },
    {
      id: 2,
      name: "Bat",
      email: "bat@example.com",
      role: "user",
      password: "demo-password-2"
    },
    {
      id: 3,
      name: "Saraa",
      email: "saraa@example.com",
      role: "user",
      password: "demo-password-3"
    },
    {
      id: 4,
      name: "Bold",
      email: "bold@example.com",
      role: "admin",
      password: "demo-password-4"
    }
  ];
  
  // ID-r herglegch oloh
  export function findUserById(id) {
    return users.find((user) => user.id === id);
  }
  
  // Email-r herglegch oloh
  export function findByEmail(email) {
    return users.find(
      (user) =>
        user.email.toLowerCase() === email.toLowerCase()
    );
  }
  
  // Admin hereglgchdiin too
  export function countAdmins() {
    return users.filter(
      (user) => user.role === "admin"
    ).length;
  }