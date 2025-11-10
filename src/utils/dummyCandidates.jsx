// Re-use the same list everywhere so clicks land on the same person
export function buildDummyCandidates() {
  const now = new Date();
  const mk = (h, m, id, name, role) => {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
    const end = new Date(start.getTime() + 45 * 60 * 1000);
    return {
      id,
      candidate: { name, email: `${name.split(" ")[0].toLowerCase()}@example.com`, phone: "+91 98765 12345" },
      role,
      start: start.toISOString(),
      end: end.toISOString(),
      status: "Scheduled",
      meetLink: "https://meet.google.com/abc-defg-hij",
      resumeUrl: "https://example.com/resume.pdf",
      notes: "Focus on HAL & CarService integration."
    };
  };

  return [
    mk(11, 0,  "INT-001", "Aarav Mehta", "Android Automotive HMI Engineer"),
    mk(15, 30, "INT-002", "Sara Khan",   "AAOS Platform Engineer"),
    mk(17, 0,  "INT-003", "Rahul Verma", "Infotainment Middleware Engineer"),
  ];
}

export function getCandidateById(id) {
  return buildDummyCandidates().find((c) => String(c.id) === String(id));
}
