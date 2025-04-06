import React, { useState, useEffect } from "react";
import { styled } from "@mui/system";
import { Box, Container, Grid, Paper, Typography, Avatar, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, useTheme, ThemeProvider, createTheme, ToggleButton, ToggleButtonGroup, TextField, InputAdornment } from "@mui/material";
import { format } from "date-fns";
import { FaUserMd, FaUserNurse, FaBed, FaHospital, FaFileMedical, FaSearch, FaTable, FaTh } from "react-icons/fa";

const StyledCard = styled(Card)(({ theme, status }) => ({
  height: "100%",
  transition: "transform 0.2s",
  "&:hover": {
    transform: "scale(1.02)",
    cursor: "pointer"
  },
  backgroundColor:
    status === "urgent" ? "#ffebee" :
    status === "normal" ? "#e8f5e9" :
    status === "pending" ? "#fff3e0" : "#ffffff"
}));

const DutyPersonnel = ({ image, name, role, contact }) => (
  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
    <Avatar src={image} sx={{ width: 56, height: 56, mr: 2 }} />
    <Box>
      <Typography variant="h6">{name}</Typography>
      <Typography variant="body2" color="textSecondary">{role}</Typography>
      <Typography variant="body2">{contact}</Typography>
    </Box>
  </Box>
);

const ClinicRoom = ({ name, doctor, nurse, waiting, completed, admitted }) => (
  <StyledCard status={waiting > 10 ? "urgent" : waiting > 5 ? "pending" : "normal"}>
    <CardContent>
      <Typography variant="h6">{name}</Typography>
      <Box sx={{ mt: 2 }}>
        <Typography><FaUserMd /> {doctor}</Typography>
        <Typography><FaUserNurse /> {nurse}</Typography>
        <Typography>Waiting: {waiting}</Typography>
        <Typography>Completed: {completed}</Typography>
        <Typography>Admitted: {admitted}</Typography>
      </Box>
    </CardContent>
  </StyledCard>
);

const DepartmentTable = ({ data }) => (
  <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Department</TableCell>
          <TableCell>Doctors</TableCell>
          <TableCell>Nurses</TableCell>
          <TableCell>Waiting</TableCell>
          <TableCell>Admitted</TableCell>
          <TableCell>Discharged</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((row) => (
          <TableRow key={row.department}>
            <TableCell>{row.department}</TableCell>
            <TableCell>{row.doctors}</TableCell>
            <TableCell>{row.nurses}</TableCell>
            <TableCell>{row.waiting}</TableCell>
            <TableCell>{row.admitted}</TableCell>
            <TableCell>{row.discharged}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

const ViewToggle = ({ view, onViewChange }) => (
  <ToggleButtonGroup
    value={view}
    exclusive
    onChange={onViewChange}
    sx={{ mb: 2 }}
  >
    <ToggleButton value="card">
      <FaTh />
    </ToggleButton>
    <ToggleButton value="table">
      <FaTable />
    </ToggleButton>
  </ToggleButtonGroup>
);

const SearchBar = ({ searchTerm, onSearchChange }) => (
  <TextField
    fullWidth
    variant="outlined"
    placeholder="Search clinics..."
    value={searchTerm}
    onChange={(e) => onSearchChange(e.target.value)}
    sx={{ mb: 2 }}
    InputProps={{
      startAdornment: (
        <InputAdornment position="start">
          <FaSearch />
        </InputAdornment>
      ),
    }}
  />
);

const TongHopHoatDong = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [view, setView] = useState("card");
  const [searchTerm, setSearchTerm] = useState("");
  const [dutyData] = useState({
    leadership: {
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d",
      name: "Dr. Sarah Johnson",
      role: "Chief Medical Officer",
      contact: "+1 (555) 123-4567"
    },
    internal: {
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2",
      name: "Dr. Michael Chen",
      role: "Internal Medicine Head",
      contact: "+1 (555) 234-5678"
    },
    external: {
      image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f",
      name: "Dr. Emily Roberts",
      role: "External Medicine Head",
      contact: "+1 (555) 345-6789"
    }
  });

  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setView(newView);
    }
  };

  const filterClinics = (clinics) => {
    return clinics.filter(clinic => 
      `Clinic ${clinic + 1}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const theme = createTheme({
    palette: {
      primary: {
        main: "#1976d2"
      },
      secondary: {
        main: "#424242"
      }
    }
  });

  const clinicData = Array.from({ length: 20 }).map((_, index) => ({
    name: `Clinic ${index + 1}`,
    doctor: "Dr. Smith",
    nurse: "Nurse Johnson",
    waiting: Math.floor(Math.random() * 15),
    completed: Math.floor(Math.random() * 20),
    admitted: Math.floor(Math.random() * 5)
  }));

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth={false}>
        <Box sx={{ py: 4 }}>
          <Typography variant="h4" sx={{ mb: 4 }}>
            Hospital Operations Dashboard
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5">
                  {format(currentTime, "PPpp")}
                </Typography>
                <Grid container spacing={3} sx={{ mt: 2 }}>
                  <Grid item xs={12} md={4}>
                    <DutyPersonnel {...dutyData.leadership} />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <DutyPersonnel {...dutyData.internal} />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <DutyPersonnel {...dutyData.external} />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h5" sx={{ mb: 2 }}>Outpatient Department</Typography>
              <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
                <ViewToggle view={view} onViewChange={handleViewChange} />
                <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
              </Box>
              
              {view === "card" ? (
                <Grid container spacing={2}>
                  {filterClinics([...Array(20).keys()]).map((index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                      <ClinicRoom {...clinicData[index]} />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Clinic Name</TableCell>
                        <TableCell>Doctor</TableCell>
                        <TableCell>Nurse</TableCell>
                        <TableCell>Waiting</TableCell>
                        <TableCell>Completed</TableCell>
                        <TableCell>Admitted</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filterClinics([...Array(20).keys()]).map((index) => (
                        <TableRow key={index}>
                          <TableCell>{clinicData[index].name}</TableCell>
                          <TableCell>{clinicData[index].doctor}</TableCell>
                          <TableCell>{clinicData[index].nurse}</TableCell>
                          <TableCell>{clinicData[index].waiting}</TableCell>
                          <TableCell>{clinicData[index].completed}</TableCell>
                          <TableCell>{clinicData[index].admitted}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h5" sx={{ mb: 2 }}>Inpatient Department</Typography>
              <DepartmentTable
                data={[
                  {
                    department: "Cardiology",
                    doctors: 5,
                    nurses: 12,
                    waiting: 8,
                    admitted: 45,
                    discharged: 6
                  },
                  {
                    department: "Neurology",
                    doctors: 4,
                    nurses: 10,
                    waiting: 5,
                    admitted: 32,
                    discharged: 4
                  }
                ]}
              />
            </Grid>
          </Grid>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default TongHopHoatDong;