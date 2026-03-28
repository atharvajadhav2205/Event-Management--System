import * as XLSX from 'xlsx';

export const exportParticipants = (event, format = 'excel') => {
  if (!event || !event.registeredStudents || event.registeredStudents.length === 0) {
    alert('No participants registered for this event yet.');
    return;
  }

  const isTeam = event.isTeamEvent;
  
  // Format Data
  const rows = [];
  
  if (isTeam) {
    event.registeredStudents.forEach((reg, index) => {
      const teamName = reg.teamName || `Team ${index + 1}`;
      const date = reg.registeredAt ? new Date(reg.registeredAt).toLocaleDateString() : 'N/A';
      
      if (reg.teamMembers && reg.teamMembers.length > 0) {
        reg.teamMembers.forEach((member, mIdx) => {
          rows.push([
            teamName,
            mIdx === 0 ? 'Leader' : `Member ${mIdx}`,
            member.name || 'N/A',
            member.email || 'N/A',
            member.phone || 'N/A',
            member.college || 'N/A',
            member.yearDept || 'N/A',
            date
          ]);
        });
      } else {
         // Fallback if no members array
         rows.push([teamName, 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', date]);
      }
    });
  } else {
    event.registeredStudents.forEach((reg) => {
      const date = reg.registeredAt ? new Date(reg.registeredAt).toLocaleDateString() : 'N/A';
      // User info might be populated or we fallback to participantName
      const name = reg.participantName || (reg.userId && reg.userId.name) || 'N/A';
      const email = (reg.userId && reg.userId.email) || 'N/A';
      const phone = (reg.userId && reg.userId.phone) || 'N/A';
      
      rows.push([
        name,
        email,
        phone,
        date
      ]);
    });
  }

  const headers = isTeam 
    ? [['Team Name', 'Role', 'Name', 'Email', 'Phone', 'College', 'Year/Dept', 'Registration Date']]
    : [['Participant Name', 'Email', 'Phone', 'Registration Date']];

  let fileName = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_participants`;

  if (format === 'excel') {
    // Merge headers and rows
    const worksheetData = [...headers, ...rows];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Auto size cols roughly
    const colWidths = headers[0].map(() => ({ wch: 20 }));
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, "Participants");
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  }
};
