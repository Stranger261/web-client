import React, { useState } from 'react';
import {
  Calendar,
  Users,
  Clock,
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Bell,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  FileText,
  Video,
  Phone,
} from 'lucide-react';

import { COLORS } from '../../../configs/CONST';
const DoctorDashboard = () => {
  const [darkMode, setDarkMode] = useState(false);

  // Mock data
  const stats = [
    {
      label: 'Total Patients',
      value: '248',
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: COLORS.info,
    },
    {
      label: "Today's Appointments",
      value: '12',
      change: '3 pending',
      trend: 'neutral',
      icon: Calendar,
      color: COLORS.warning,
    },
    {
      label: 'Avg. Wait Time',
      value: '18 min',
      change: '-5 min',
      trend: 'up',
      icon: Clock,
      color: COLORS.success,
    },
    {
      label: 'Patient Satisfaction',
      value: '4.8/5',
      change: '+0.2',
      trend: 'up',
      icon: Activity,
      color: COLORS.accent,
    },
  ];

  const appointments = [
    {
      id: 1,
      time: '09:00 AM',
      patient: 'Sarah Johnson',
      age: 34,
      reason: 'Annual Checkup',
      type: 'In-Person',
      status: 'completed',
      priority: 'normal',
    },
    {
      id: 2,
      time: '09:30 AM',
      patient: 'Michael Chen',
      age: 45,
      reason: 'Follow-up Consultation',
      type: 'Video Call',
      status: 'in-progress',
      priority: 'normal',
    },
    {
      id: 3,
      time: '10:00 AM',
      patient: 'Emma Davis',
      age: 28,
      reason: 'Lab Results Review',
      type: 'In-Person',
      status: 'waiting',
      priority: 'high',
    },
    {
      id: 4,
      time: '10:30 AM',
      patient: 'James Wilson',
      age: 52,
      reason: 'Blood Pressure Check',
      type: 'In-Person',
      status: 'scheduled',
      priority: 'normal',
    },
    {
      id: 5,
      time: '11:00 AM',
      patient: 'Lisa Anderson',
      age: 41,
      reason: 'Medication Review',
      type: 'Phone Call',
      status: 'scheduled',
      priority: 'normal',
    },
  ];

  const recentActivity = [
    {
      type: 'prescription',
      patient: 'Sarah Johnson',
      action: 'Prescription updated',
      time: '5 min ago',
      icon: FileText,
    },
    {
      type: 'appointment',
      patient: 'Michael Chen',
      action: 'Appointment rescheduled',
      time: '15 min ago',
      icon: Calendar,
    },
    {
      type: 'lab',
      patient: 'Emma Davis',
      action: 'Lab results available',
      time: '1 hour ago',
      icon: Activity,
    },
    {
      type: 'note',
      patient: 'James Wilson',
      action: 'Clinical note added',
      time: '2 hours ago',
      icon: FileText,
    },
  ];

  const alerts = [
    {
      id: 1,
      type: 'critical',
      message:
        'Critical lab result for Emma Davis requires immediate attention',
      time: '10 min ago',
    },
    {
      id: 2,
      type: 'warning',
      message: 'Prescription refill request from 3 patients pending approval',
      time: '1 hour ago',
    },
    {
      id: 3,
      type: 'info',
      message: 'New patient registration: Robert Martinez',
      time: '2 hours ago',
    },
  ];

  const bgColor = darkMode ? COLORS.background.dark : COLORS.background.light;
  const cardBg = darkMode
    ? COLORS.card.background.dark
    : COLORS.card.background.light;
  const textPrimary = darkMode ? COLORS.text.white : COLORS.text.primary;
  const textSecondary = darkMode ? COLORS.text.light : COLORS.text.secondary;
  const borderColor = darkMode ? COLORS.border.dark : COLORS.border.light;

  const getStatusBadge = status => {
    const badges = {
      completed: {
        bg: darkMode ? COLORS.badge.success.bgDark : COLORS.badge.success.bg,
        text: darkMode
          ? COLORS.badge.success.textDark
          : COLORS.badge.success.text,
        label: 'Completed',
      },
      'in-progress': {
        bg: darkMode ? COLORS.badge.info.bgDark : COLORS.badge.info.bg,
        text: darkMode ? COLORS.badge.info.textDark : COLORS.badge.info.text,
        label: 'In Progress',
      },
      waiting: {
        bg: darkMode ? COLORS.badge.warning.bgDark : COLORS.badge.warning.bg,
        text: darkMode
          ? COLORS.badge.warning.textDark
          : COLORS.badge.warning.text,
        label: 'Waiting',
      },
      scheduled: {
        bg: darkMode ? COLORS.surface.dark : COLORS.surface.light,
        text: textSecondary,
        label: 'Scheduled',
      },
    };
    return badges[status] || badges.scheduled;
  };

  const getPriorityBadge = priority => {
    if (priority === 'high') {
      return {
        bg: darkMode ? COLORS.badge.danger.bgDark : COLORS.badge.danger.bg,
        text: darkMode
          ? COLORS.badge.danger.textDark
          : COLORS.badge.danger.text,
      };
    }
    return null;
  };

  return (
    <div
      style={{
        backgroundColor: bgColor,
        minHeight: '100vh',
        padding: '24px',
        transition: 'background-color 0.3s',
      }}
    >
      {/* Header */}
      <div
        style={{
          marginBottom: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: '700',
              color: textPrimary,
              marginBottom: '8px',
            }}
          >
            Welcome back, Dr. Smith
          </h1>
          <p style={{ color: textSecondary, fontSize: '14px' }}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              padding: '10px 20px',
              backgroundColor: cardBg,
              color: textPrimary,
              border: `1px solid ${borderColor}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s',
            }}
          >
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
          <button
            style={{
              position: 'relative',
              padding: '10px',
              backgroundColor: cardBg,
              border: `1px solid ${borderColor}`,
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Bell size={20} color={textPrimary} />
            <span
              style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                width: '8px',
                height: '8px',
                backgroundColor: COLORS.danger,
                borderRadius: '50%',
              }}
            ></span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
        }}
      >
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              style={{
                backgroundColor: cardBg,
                padding: '24px',
                borderRadius: '12px',
                border: `1px solid ${borderColor}`,
                boxShadow: COLORS.card.shadow.sm,
                transition: 'all 0.3s',
                cursor: 'pointer',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = COLORS.card.shadow.md;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = COLORS.card.shadow.sm;
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      color: textSecondary,
                      fontSize: '14px',
                      marginBottom: '8px',
                    }}
                  >
                    {stat.label}
                  </p>
                  <p
                    style={{
                      fontSize: '32px',
                      fontWeight: '700',
                      color: textPrimary,
                      marginBottom: '8px',
                    }}
                  >
                    {stat.value}
                  </p>
                  <p
                    style={{
                      fontSize: '13px',
                      color:
                        stat.trend === 'up' ? COLORS.success : textSecondary,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {stat.trend === 'up' && <TrendingUp size={14} />}
                    {stat.change}
                  </p>
                </div>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: stat.color + '20',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={24} color={stat.color} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid - Responsive */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '24px',
        }}
      >
        <style>{`
          @media (min-width: 1024px) {
            .dashboard-grid {
              grid-template-columns: 2fr 1fr;
            }
          }
        `}</style>
        <div
          className="dashboard-grid"
          style={{ display: 'grid', gap: '24px' }}
        >
          {/* Left Column */}
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
          >
            {/* Appointments Card */}
            <div
              style={{
                backgroundColor: cardBg,
                borderRadius: '12px',
                border: `1px solid ${borderColor}`,
                boxShadow: COLORS.card.shadow.sm,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '24px',
                  borderBottom: `1px solid ${borderColor}`,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <h2
                    style={{
                      fontSize: '20px',
                      fontWeight: '600',
                      color: textPrimary,
                    }}
                  >
                    Today's Appointments
                  </h2>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      style={{
                        padding: '8px 12px',
                        backgroundColor: 'transparent',
                        border: `1px solid ${borderColor}`,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        color: textPrimary,
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Filter size={16} />
                      Filter
                    </button>
                  </div>
                </div>

                {/* Search Bar */}
                <div style={{ position: 'relative' }}>
                  <Search
                    size={18}
                    color={textSecondary}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Search appointments..."
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 40px',
                      backgroundColor: darkMode
                        ? COLORS.input.backgroundDark
                        : COLORS.input.background,
                      border: `1px solid ${
                        darkMode ? COLORS.input.borderDark : COLORS.input.border
                      }`,
                      borderRadius: '8px',
                      color: textPrimary,
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Appointments List */}
              <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {appointments.map(apt => {
                  const statusBadge = getStatusBadge(apt.status);
                  const priorityBadge = getPriorityBadge(apt.priority);

                  return (
                    <div
                      key={apt.id}
                      style={{
                        padding: '20px 24px',
                        borderBottom: `1px solid ${borderColor}`,
                        transition: 'background-color 0.2s',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={e =>
                        (e.currentTarget.style.backgroundColor = darkMode
                          ? COLORS.surface.darkHover
                          : COLORS.surface.lightHover)
                      }
                      onMouseLeave={e =>
                        (e.currentTarget.style.backgroundColor = 'transparent')
                      }
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          flexWrap: 'wrap',
                          gap: '12px',
                        }}
                      >
                        <div style={{ flex: '1', minWidth: '200px' }}>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              marginBottom: '8px',
                            }}
                          >
                            <div
                              style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                backgroundColor: COLORS.info + '20',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: '600',
                                color: COLORS.info,
                                fontSize: '14px',
                              }}
                            >
                              {apt.patient
                                .split(' ')
                                .map(n => n[0])
                                .join('')}
                            </div>
                            <div>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  flexWrap: 'wrap',
                                }}
                              >
                                <p
                                  style={{
                                    fontWeight: '600',
                                    color: textPrimary,
                                    fontSize: '15px',
                                  }}
                                >
                                  {apt.patient}
                                </p>
                                {priorityBadge && (
                                  <span
                                    style={{
                                      padding: '2px 8px',
                                      borderRadius: '12px',
                                      fontSize: '11px',
                                      fontWeight: '600',
                                      backgroundColor: priorityBadge.bg,
                                      color: priorityBadge.text,
                                    }}
                                  >
                                    HIGH
                                  </span>
                                )}
                              </div>
                              <p
                                style={{
                                  color: textSecondary,
                                  fontSize: '13px',
                                }}
                              >
                                {apt.age} years • {apt.type}
                              </p>
                            </div>
                          </div>
                          <div style={{ marginLeft: '52px' }}>
                            <p
                              style={{
                                color: textSecondary,
                                fontSize: '13px',
                                marginBottom: '4px',
                              }}
                            >
                              <Clock
                                size={14}
                                style={{
                                  display: 'inline',
                                  marginRight: '4px',
                                  verticalAlign: 'middle',
                                }}
                              />
                              {apt.time}
                            </p>
                            <p style={{ color: textPrimary, fontSize: '14px' }}>
                              {apt.reason}
                            </p>
                          </div>
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            flexWrap: 'wrap',
                          }}
                        >
                          <span
                            style={{
                              padding: '4px 12px',
                              borderRadius: '16px',
                              fontSize: '12px',
                              fontWeight: '500',
                              backgroundColor: statusBadge.bg,
                              color: statusBadge.text,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {statusBadge.label}
                          </span>

                          <div style={{ display: 'flex', gap: '4px' }}>
                            {apt.type === 'Video Call' && (
                              <button
                                style={{
                                  padding: '8px',
                                  backgroundColor: COLORS.button.edit.bg,
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <Video size={16} color="white" />
                              </button>
                            )}
                            {apt.type === 'Phone Call' && (
                              <button
                                style={{
                                  padding: '8px',
                                  backgroundColor: COLORS.success,
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <Phone size={16} color="white" />
                              </button>
                            )}
                            <button
                              style={{
                                padding: '8px',
                                backgroundColor: 'transparent',
                                border: `1px solid ${borderColor}`,
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Eye size={16} color={textPrimary} />
                            </button>
                            <button
                              style={{
                                padding: '8px',
                                backgroundColor: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <MoreVertical size={16} color={textSecondary} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
          >
            {/* Alerts Card */}
            <div
              style={{
                backgroundColor: cardBg,
                borderRadius: '12px',
                border: `1px solid ${borderColor}`,
                boxShadow: COLORS.card.shadow.sm,
                padding: '24px',
              }}
            >
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: textPrimary,
                  marginBottom: '16px',
                }}
              >
                Alerts & Notifications
              </h3>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                {alerts.map(alert => {
                  const alertColors = {
                    critical: {
                      bg: darkMode
                        ? COLORS.badge.danger.bgDark
                        : COLORS.badge.danger.bg,
                      icon: COLORS.danger,
                    },
                    warning: {
                      bg: darkMode
                        ? COLORS.badge.warning.bgDark
                        : COLORS.badge.warning.bg,
                      icon: COLORS.warning,
                    },
                    info: {
                      bg: darkMode
                        ? COLORS.badge.info.bgDark
                        : COLORS.badge.info.bg,
                      icon: COLORS.info,
                    },
                  };
                  const alertColor = alertColors[alert.type];

                  return (
                    <div
                      key={alert.id}
                      style={{
                        padding: '12px',
                        backgroundColor: alertColor.bg,
                        borderRadius: '8px',
                        borderLeft: `4px solid ${alertColor.icon}`,
                      }}
                    >
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <AlertCircle
                          size={18}
                          color={alertColor.icon}
                          style={{ flexShrink: 0, marginTop: '2px' }}
                        />
                        <div style={{ flex: 1 }}>
                          <p
                            style={{
                              fontSize: '13px',
                              color: textPrimary,
                              marginBottom: '4px',
                              lineHeight: '1.5',
                            }}
                          >
                            {alert.message}
                          </p>
                          <p style={{ fontSize: '12px', color: textSecondary }}>
                            {alert.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity Card */}
            <div
              style={{
                backgroundColor: cardBg,
                borderRadius: '12px',
                border: `1px solid ${borderColor}`,
                boxShadow: COLORS.card.shadow.sm,
                padding: '24px',
              }}
            >
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: textPrimary,
                  marginBottom: '16px',
                }}
              >
                Recent Activity
              </h3>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                {recentActivity.map((activity, idx) => {
                  const Icon = activity.icon;
                  return (
                    <div key={idx} style={{ display: 'flex', gap: '12px' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: darkMode
                            ? COLORS.surface.dark
                            : COLORS.surface.light,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={18} color={COLORS.info} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p
                          style={{
                            fontSize: '14px',
                            color: textPrimary,
                            marginBottom: '2px',
                          }}
                        >
                          <strong>{activity.patient}</strong>
                        </p>
                        <p
                          style={{
                            fontSize: '13px',
                            color: textSecondary,
                            marginBottom: '2px',
                          }}
                        >
                          {activity.action}
                        </p>
                        <p style={{ fontSize: '12px', color: textSecondary }}>
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions Card */}
            <div
              style={{
                backgroundColor: cardBg,
                borderRadius: '12px',
                border: `1px solid ${borderColor}`,
                boxShadow: COLORS.card.shadow.sm,
                padding: '24px',
              }}
            >
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: textPrimary,
                  marginBottom: '16px',
                }}
              >
                Quick Actions
              </h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '12px',
                }}
              >
                <button
                  style={{
                    padding: '16px',
                    backgroundColor: COLORS.button.create.bg,
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e =>
                    (e.currentTarget.style.backgroundColor =
                      COLORS.button.create.bgHover)
                  }
                  onMouseLeave={e =>
                    (e.currentTarget.style.backgroundColor =
                      COLORS.button.create.bg)
                  }
                >
                  <Calendar size={18} />
                  <span
                    style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    New Appointment
                  </span>
                </button>
                <button
                  style={{
                    padding: '16px',
                    backgroundColor: COLORS.button.edit.bg,
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e =>
                    (e.currentTarget.style.backgroundColor =
                      COLORS.button.edit.bgHover)
                  }
                  onMouseLeave={e =>
                    (e.currentTarget.style.backgroundColor =
                      COLORS.button.edit.bg)
                  }
                >
                  <FileText size={18} />
                  <span
                    style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    Write Note
                  </span>
                </button>
                <button
                  style={{
                    padding: '16px',
                    backgroundColor: 'transparent',
                    color: textPrimary,
                    border: `1px solid ${borderColor}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e =>
                    (e.currentTarget.style.backgroundColor = darkMode
                      ? COLORS.surface.darkHover
                      : COLORS.surface.lightHover)
                  }
                  onMouseLeave={e =>
                    (e.currentTarget.style.backgroundColor = 'transparent')
                  }
                >
                  <Users size={18} />
                  <span
                    style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    View Patients
                  </span>
                </button>
                <button
                  style={{
                    padding: '16px',
                    backgroundColor: 'transparent',
                    color: textPrimary,
                    border: `1px solid ${borderColor}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e =>
                    (e.currentTarget.style.backgroundColor = darkMode
                      ? COLORS.surface.darkHover
                      : COLORS.surface.lightHover)
                  }
                  onMouseLeave={e =>
                    (e.currentTarget.style.backgroundColor = 'transparent')
                  }
                >
                  <Activity size={18} />
                  <span
                    style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    Lab Results
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
