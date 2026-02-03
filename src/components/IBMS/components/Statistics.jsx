import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardHeader,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Bed,
  LocalHospital,
  People,
  CalendarToday,
  Refresh,
  Warning,
  CheckCircle,
  Timeline,
  BarChart,
  PieChart,
  DateRange,
  FilterList,
  Download,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  LineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// API Base URL
const API_BASE_URL = 'http://localhost:56741/api/v1/bedStats';

const Statistics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [currentAssignments, setCurrentAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)),
    end: new Date(),
  });
  const [filterFloor, setFilterFloor] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterRoomType, setFilterRoomType] = useState('');
  const [filterBedType, setFilterBedType] = useState('');

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const days = Math.floor(
        (dateRange.end.getTime() - dateRange.start.getTime()) /
          (1000 * 60 * 60 * 24),
      );

      const response = await fetch(`${API_BASE_URL}/dashboard?days=${days}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch dashboard data');
      }

      const data = await response.json();
      if (data.success) {
        setDashboardData(data.data);
      } else {
        throw new Error(data.message || 'Failed to load statistics');
      }
    } catch (err) {
      setError(err.message || 'Failed to load statistics');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch specific endpoint data
  const fetchSpecificData = async (endpoint, params = {}) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = `${API_BASE_URL}/${endpoint}${queryParams ? `?${queryParams}` : ''}`;

      const response = await fetch(url, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch ${endpoint}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error(`Error fetching ${endpoint}:`, err);
      throw err;
    }
  };

  // Fetch current bed assignments
  const fetchCurrentAssignments = async () => {
    try {
      setLoadingAssignments(true);
      const params = {};
      if (filterFloor) params.floor = filterFloor;
      if (filterRoomType) params.roomType = filterRoomType;
      if (filterBedType) params.bedType = filterBedType;

      const response = await fetchSpecificData('current-assignments', params);
      setCurrentAssignments(response.data.assignments || []);
    } catch (err) {
      console.error('Error fetching current assignments:', err);
      setError(err.message);
    } finally {
      setLoadingAssignments(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Load assignments when tab changes to assignments
  useEffect(() => {
    if (activeTab === 5) {
      fetchCurrentAssignments();
    }
  }, [activeTab, filterFloor, filterRoomType, filterBedType]);

  const handleRefresh = () => {
    fetchDashboardData();
    if (activeTab === 5) {
      fetchCurrentAssignments();
    }
  };

  const handleDateRangeChange = (newStart, newEnd) => {
    setDateRange({ start: newStart, end: newEnd });
  };

  const handleApplyDateRange = () => {
    fetchDashboardData();
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const getStatusColor = status => {
    switch (status) {
      case 'occupied':
        return 'error';
      case 'available':
        return 'success';
      case 'maintenance':
        return 'warning';
      case 'cleaning':
        return 'info';
      default:
        return 'default';
    }
  };

  const getPriorityColor = priority => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatDate = date => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = date => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
        <Button onClick={handleRefresh} sx={{ ml: 2 }}>
          Retry
        </Button>
      </Alert>
    );
  }

  if (!dashboardData) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        No data available
      </Alert>
    );
  }

  const {
    overview,
    occupancy_trends,
    department_utilization,
    beds_requiring_attention,
    admission_stats,
    turnover_rate,
    generated_at,
    period,
  } = dashboardData;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={4}
        >
          <Box>
            <Typography variant="h4" gutterBottom>
              Bed Statistics Dashboard
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Comprehensive overview of hospital bed utilization and management
            </Typography>
          </Box>
          <Box display="flex" gap={2} alignItems="center">
            <Box display="flex" gap={1}>
              <DatePicker
                label="Start Date"
                value={dateRange.start}
                onChange={newValue =>
                  handleDateRangeChange(newValue, dateRange.end)
                }
                slotProps={{ textField: { size: 'small' } }}
              />
              <DatePicker
                label="End Date"
                value={dateRange.end}
                onChange={newValue =>
                  handleDateRangeChange(dateRange.start, newValue)
                }
                slotProps={{ textField: { size: 'small' } }}
              />
              <Button
                variant="contained"
                onClick={handleApplyDateRange}
                size="small"
              >
                Apply
              </Button>
            </Box>
            <Tooltip title="Refresh Data">
              <IconButton onClick={handleRefresh}>
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Tabs for different views */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<BarChart />} label="Overview" />
            <Tab icon={<Timeline />} label="Trends" />
            <Tab icon={<LocalHospital />} label="Departments" />
            <Tab icon={<Warning />} label="Attention Required" />
            <Tab icon={<People />} label="Admissions" />
            <Tab icon={<Bed />} label="Current Assignments" />
          </Tabs>
        </Paper>

        {/* Overview Tab */}
        {activeTab === 0 && (
          <Grid container spacing={3}>
            {/* Key Metrics */}
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Bed color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Total Beds</Typography>
                  </Box>
                  <Typography variant="h3">{overview.total_beds}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Available: {overview.available_beds}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    <People color="error" sx={{ mr: 1 }} />
                    <Typography variant="h6">Occupied Beds</Typography>
                  </Box>
                  <Typography variant="h3">{overview.occupied_beds}</Typography>
                  <Box display="flex" alignItems="center" mt={1}>
                    <Typography variant="body2" color="text.secondary">
                      Occupancy Rate:
                    </Typography>
                    <Chip
                      label={`${overview.occupancy_rate}%`}
                      color={
                        overview.occupancy_rate > 85
                          ? 'error'
                          : overview.occupancy_rate > 70
                            ? 'warning'
                            : 'success'
                      }
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Warning color="warning" sx={{ mr: 1 }} />
                    <Typography variant="h6">Requiring Attention</Typography>
                  </Box>
                  <Typography variant="h3">
                    {overview.maintenance_beds + overview.cleaning_beds}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Maintenance: {overview.maintenance_beds} | Cleaning:{' '}
                    {overview.cleaning_beds}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    <TrendingUp color="success" sx={{ mr: 1 }} />
                    <Typography variant="h6">Turnover Rate</Typography>
                  </Box>
                  <Typography variant="h3">
                    {turnover_rate?.overall_rate?.toFixed(2) || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Beds/day in period
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Occupancy Trend Chart */}
            <Grid item xs={12} md={8}>
              <Card>
                <CardHeader
                  title="Occupancy Trend"
                  action={
                    <IconButton size="small">
                      <FilterList />
                    </IconButton>
                  }
                />
                <CardContent sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={occupancy_trends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="occupancy_rate"
                        name="Occupancy Rate (%)"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="occupied_beds"
                        name="Occupied Beds"
                        stroke="#82ca9d"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Department Distribution */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardHeader title="Department Distribution" />
                <CardContent sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={overview.departments || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={entry =>
                          `${entry.name}: ${entry.occupied_beds}/${entry.total_beds}`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="occupied_beds"
                      >
                        {(overview.departments || []).map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Department Utilization Table */}
            <Grid item xs={12}>
              <Card>
                <CardHeader title="Department Utilization" />
                <CardContent>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Department</TableCell>
                          <TableCell align="right">Total Beds</TableCell>
                          <TableCell align="right">Occupied</TableCell>
                          <TableCell align="right">Occupancy Rate</TableCell>
                          <TableCell align="right">Avg Stay (days)</TableCell>
                          <TableCell align="right">Turnover Rate</TableCell>
                          <TableCell align="right">Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {department_utilization.map(dept => (
                          <TableRow key={dept.department_id}>
                            <TableCell>{dept.department_name}</TableCell>
                            <TableCell align="right">
                              {dept.total_beds}
                            </TableCell>
                            <TableCell align="right">
                              {dept.occupied_beds}
                            </TableCell>
                            <TableCell align="right">
                              <Box
                                display="flex"
                                alignItems="center"
                                justifyContent="flex-end"
                              >
                                <Box sx={{ width: '60%', mr: 1 }}>
                                  <LinearProgress
                                    variant="determinate"
                                    value={dept.occupancy_rate}
                                    color={
                                      dept.occupancy_rate > 85
                                        ? 'error'
                                        : dept.occupancy_rate > 70
                                          ? 'warning'
                                          : 'success'
                                    }
                                  />
                                </Box>
                                {dept.occupancy_rate}%
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              {dept.avg_length_of_stay?.toFixed(1) || 'N/A'}
                            </TableCell>
                            <TableCell align="right">
                              {dept.turnover_rate?.toFixed(2) || 'N/A'}
                            </TableCell>
                            <TableCell align="right">
                              <Chip
                                label={
                                  dept.occupancy_rate > 85
                                    ? 'Critical'
                                    : dept.occupancy_rate > 70
                                      ? 'High'
                                      : 'Normal'
                                }
                                size="small"
                                color={
                                  dept.occupancy_rate > 85
                                    ? 'error'
                                    : dept.occupancy_rate > 70
                                      ? 'warning'
                                      : 'success'
                                }
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Trends Tab */}
        {activeTab === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardHeader
                  title="Detailed Occupancy Analysis"
                  subheader="Historical trends and patterns"
                />
                <CardContent sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={occupancy_trends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <RechartsTooltip />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="occupancy_rate"
                        name="Occupancy Rate (%)"
                        stroke="#8884d8"
                        strokeWidth={2}
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="occupied_beds"
                        name="Occupied Beds"
                        stroke="#82ca9d"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="total_beds"
                        name="Total Beds"
                        stroke="#ffc658"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Admission Trends" />
                <CardContent sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={admission_stats?.trend || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar
                        dataKey="admissions"
                        name="Daily Admissions"
                        fill="#8884d8"
                      />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Turnover Statistics" />
                <CardContent>
                  <Box mb={2}>
                    <Typography variant="h6" gutterBottom>
                      Overall Turnover Rate
                    </Typography>
                    <Typography variant="h3" color="primary">
                      {turnover_rate?.overall_rate?.toFixed(2) || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Beds turned over per day
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Period Summary
                    </Typography>
                    <Typography variant="body2">
                      Total Discharges: {turnover_rate?.total_discharges || 0}
                    </Typography>
                    <Typography variant="body2">
                      Average Beds: {turnover_rate?.average_beds || 0}
                    </Typography>
                    <Typography variant="body2">
                      Days: {turnover_rate?.days || 0}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Departments Tab */}
        {activeTab === 2 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardHeader title="Department Performance" />
                <CardContent sx={{ height: 350 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={department_utilization}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="department_name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar
                        dataKey="occupancy_rate"
                        name="Occupancy Rate (%)"
                        fill="#8884d8"
                      />
                      <Bar
                        dataKey="turnover_rate"
                        name="Turnover Rate"
                        fill="#82ca9d"
                      />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardHeader title="Quick Stats by Department" />
                <CardContent>
                  {department_utilization.map(dept => (
                    <Box key={dept.department_id} mb={2}>
                      <Typography variant="subtitle1" gutterBottom>
                        {dept.department_name}
                      </Typography>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">
                          Occupancy:
                        </Typography>
                        <Chip
                          label={`${dept.occupancy_rate}%`}
                          size="small"
                          color={
                            dept.occupancy_rate > 85
                              ? 'error'
                              : dept.occupancy_rate > 70
                                ? 'warning'
                                : 'success'
                          }
                        />
                      </Box>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        mt={0.5}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Avg Stay:
                        </Typography>
                        <Typography variant="body2">
                          {dept.avg_length_of_stay?.toFixed(1) || 'N/A'} days
                        </Typography>
                      </Box>
                      <Divider sx={{ mt: 1 }} />
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Attention Required Tab */}
        {activeTab === 3 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardHeader
                  title="Beds Requiring Attention"
                  action={
                    <Chip
                      icon={<Warning />}
                      label={`${beds_requiring_attention.length} beds need attention`}
                      color="warning"
                    />
                  }
                />
                <CardContent>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Bed Number</TableCell>
                          <TableCell>Room</TableCell>
                          <TableCell>Floor</TableCell>
                          <TableCell>Department</TableCell>
                          <TableCell>Issue Type</TableCell>
                          <TableCell>Priority</TableCell>
                          <TableCell>Reported At</TableCell>
                          <TableCell>Description</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {beds_requiring_attention.length > 0 ? (
                          beds_requiring_attention.map(bed => (
                            <TableRow key={bed.bed_id}>
                              <TableCell>
                                <Box display="flex" alignItems="center">
                                  <Bed sx={{ mr: 1, fontSize: 'small' }} />
                                  {bed.bed_number}
                                </Box>
                              </TableCell>
                              <TableCell>{bed.room_number}</TableCell>
                              <TableCell>Floor {bed.floor}</TableCell>
                              <TableCell>{bed.department}</TableCell>
                              <TableCell>
                                <Chip
                                  label={bed.issue_type}
                                  size="small"
                                  color={
                                    bed.issue_type === 'maintenance'
                                      ? 'warning'
                                      : 'info'
                                  }
                                />
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={bed.priority}
                                  size="small"
                                  color={getPriorityColor(bed.priority)}
                                />
                              </TableCell>
                              <TableCell>
                                {formatDateTime(bed.reported_at)}
                              </TableCell>
                              <TableCell>
                                <Typography
                                  variant="body2"
                                  noWrap
                                  sx={{ maxWidth: 200 }}
                                >
                                  {bed.description || 'No description'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Button size="small" variant="outlined">
                                  Mark Resolved
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={9} align="center">
                              <Box py={3}>
                                <CheckCircle
                                  color="success"
                                  sx={{ fontSize: 48, mb: 1 }}
                                />
                                <Typography variant="h6" color="text.secondary">
                                  All beds are in good condition
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  No beds require attention at this time
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Admissions Tab */}
        {activeTab === 4 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Admission Summary
                  </Typography>
                  <Typography variant="h3" gutterBottom>
                    {admission_stats?.total_admissions || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Admissions
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    Daily Average:{' '}
                    {admission_stats?.daily_average?.toFixed(1) || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={8}>
              <Card>
                <CardHeader title="Admissions by Department" />
                <CardContent sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={admission_stats?.by_department || []}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="department_name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar
                        dataKey="admissions"
                        name="Admissions"
                        fill="#8884d8"
                      />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardHeader title="Admission Trends Over Time" />
                <CardContent sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={admission_stats?.trend || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="admissions"
                        name="Admissions"
                        stroke="#8884d8"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Current Assignments Tab */}
        {activeTab === 5 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardHeader
                  title="Current Bed Assignments"
                  action={
                    <Box display="flex" gap={2}>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Filter by Floor</InputLabel>
                        <Select
                          value={filterFloor}
                          label="Filter by Floor"
                          onChange={e => setFilterFloor(e.target.value)}
                        >
                          <MenuItem value="">All Floors</MenuItem>
                          {[1, 2, 3, 4, 5].map(floor => (
                            <MenuItem key={floor} value={floor}>
                              Floor {floor}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Room Type</InputLabel>
                        <Select
                          value={filterRoomType}
                          label="Room Type"
                          onChange={e => setFilterRoomType(e.target.value)}
                        >
                          <MenuItem value="">All Types</MenuItem>
                          <MenuItem value="private">Private</MenuItem>
                          <MenuItem value="semi-private">Semi-Private</MenuItem>
                          <MenuItem value="ward">Ward</MenuItem>
                          <MenuItem value="icu">ICU</MenuItem>
                        </Select>
                      </FormControl>
                      <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Bed Type</InputLabel>
                        <Select
                          value={filterBedType}
                          label="Bed Type"
                          onChange={e => setFilterBedType(e.target.value)}
                        >
                          <MenuItem value="">All Types</MenuItem>
                          <MenuItem value="standard">Standard</MenuItem>
                          <MenuItem value="electric">Electric</MenuItem>
                          <MenuItem value="icu">ICU</MenuItem>
                          <MenuItem value="pediatric">Pediatric</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  }
                />
                <CardContent>
                  {loadingAssignments ? (
                    <Box display="flex" justifyContent="center" py={4}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Showing {currentAssignments.length} bed assignments
                      </Typography>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Patient</TableCell>
                              <TableCell>Bed/Room</TableCell>
                              <TableCell>Floor/Dept</TableCell>
                              <TableCell>Admission Date</TableCell>
                              <TableCell>Expected Discharge</TableCell>
                              <TableCell>Attending Doctor</TableCell>
                              <TableCell>Status</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {currentAssignments.length > 0 ? (
                              currentAssignments.map((assignment, index) => (
                                <TableRow
                                  key={assignment.assignment_id || index}
                                >
                                  <TableCell>
                                    <Typography
                                      variant="body2"
                                      fontWeight="medium"
                                    >
                                      {assignment.patient_name}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      ID: {assignment.patient_id}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2">
                                      Bed {assignment.bed_number}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      Room {assignment.room_number}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2">
                                      Floor {assignment.floor}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {assignment.department}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    {formatDate(assignment.admission_date)}
                                  </TableCell>
                                  <TableCell>
                                    {formatDate(assignment.expected_discharge)}
                                  </TableCell>
                                  <TableCell>
                                    {assignment.attending_doctor || 'N/A'}
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label={assignment.status || 'Active'}
                                      size="small"
                                      color="success"
                                    />
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={7} align="center">
                                  <Box py={3}>
                                    <Typography
                                      variant="body1"
                                      color="text.secondary"
                                    >
                                      No bed assignments match the current
                                      filters
                                    </Typography>
                                    <Button
                                      variant="outlined"
                                      sx={{ mt: 2 }}
                                      onClick={() => {
                                        setFilterFloor('');
                                        setFilterRoomType('');
                                        setFilterBedType('');
                                      }}
                                    >
                                      Clear Filters
                                    </Button>
                                  </Box>
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Footer Info */}
        <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary" align="center">
            Data last updated: {formatDateTime(generated_at)} | Period:{' '}
            {formatDate(period.start_date)} - {formatDate(period.end_date)} (
            {period.days} days)
          </Typography>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default Statistics;
