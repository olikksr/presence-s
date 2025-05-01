import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, SafeAreaView } from 'react-native';
import { useTimeStore, getAttendanceHistory } from '../../store/timeStore';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

interface Location {
  distance_km: number;
  latitude: number;
  longitude: number;
  type: string;
}

interface AttendanceEntry {
  id: string;
  date: string;
  clock_in: string;
  clock_out: string | null;
  clock_in_shift_status: string;
  clock_out_shift_status: string;
  status: string;
  standing: string;
  working_hours: number;
  location: Location;
  clock_out_location?: Location;
  clock_in_shift_time_difference_minutes?: number;
  clock_out_shift_time_difference_minutes?: number;
}

export default function HistoryScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<AttendanceEntry[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await getAttendanceHistory();
        
        // Check if response has the expected structure
        if (response && response.data) {
          setHistoryData(response.data);
        } else {
          // If we're getting the old format from timeStore
          setHistoryData(response);
        }
        
        setError(null);
      } catch (err) {
        console.error('Failed to fetch history:', err);
        setError('Failed to load attendance history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const formatShiftStatus = (status: string) => {
    if (!status) return '';
    if (status === 'NO_SHIFT_FOR_DAY') return 'No Shift';
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  const getStatusIcon = (standing: string) => {
    if (!standing) return 'help-circle-outline';
    
    switch (standing.toLowerCase()) {
      case 'present':
        return 'checkmark-circle';
      case 'absent':
        return 'close-circle';
      case 'late':
        return 'time';
      default:
        return 'help-circle-outline';
    }
  };

  const renderItem = ({ item }: { item: AttendanceEntry }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.date}>
          {format(new Date(item.date || item.clock_in), 'MMMM dd, yyyy')}
        </Text>
        
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, getStatusStyle(item.standing)]}>
            <Ionicons 
              name={getStatusIcon(item.standing)} 
              size={14} 
              color={getStatusIconColor(item.standing)} 
              style={styles.statusIcon}
            />
            <Text style={[styles.statusText, getStatusTextStyle(item.standing)]}>
              {item.standing ? item.standing.toUpperCase() : 'UNKNOWN'}
            </Text>
          </View>
          <Text style={styles.hoursText}>
            {item.working_hours || 0} hours
          </Text>
        </View>
      </View>
      
      <View style={styles.timeSection}>
        <View style={styles.timeRow}>
          <View style={styles.timeIconContainer}>
            <Ionicons name="log-in" size={18} color="#007AFF" />
          </View>
          <View style={styles.timeContent}>
            <Text style={styles.timeLabel}>Clock In</Text>
            <Text style={styles.timeValue}>
              {format(new Date(item.clock_in), 'h:mm a')}
            </Text>
            {item.clock_in_shift_status && (
              <Text style={styles.shiftStatus}>
                {formatShiftStatus(item.clock_in_shift_status)}
                {item.clock_in_shift_time_difference_minutes ? 
                  ` (${Math.floor(item.clock_in_shift_time_difference_minutes / 60)}h ${item.clock_in_shift_time_difference_minutes % 60}m)` : 
                  ''}
              </Text>
            )}
          </View>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.timeRow}>
          <View style={styles.timeIconContainer}>
            <Ionicons name="log-out" size={18} color="#FF3B30" />
          </View>
          <View style={styles.timeContent}>
            <Text style={styles.timeLabel}>Clock Out</Text>
            {item.clock_out ? (
              <>
                <Text style={styles.timeValue}>
                  {format(new Date(item.clock_out), 'h:mm a')}
                </Text>
                {item.clock_out_shift_status && (
                  <Text style={styles.shiftStatus}>
                    {formatShiftStatus(item.clock_out_shift_status)}
                    {item.clock_out_shift_time_difference_minutes ? 
                      ` (${Math.floor(item.clock_out_shift_time_difference_minutes / 60)}h ${item.clock_out_shift_time_difference_minutes % 60}m)` : 
                      ''}
                  </Text>
                )}
              </>
            ) : (
              <Text style={styles.notClockedOut}>Not clocked out</Text>
            )}
          </View>
        </View>
      </View>
      
      {(item.location || item.clock_out_location) && (
        <View style={styles.locationSection}>
          {item.location && (
            <View style={styles.locationContainer}>
              <View style={styles.locationIconContainer}>
                <Ionicons name="navigate" size={16} color="#5856D6" />
              </View>
              <View style={styles.locationContent}>
                <Text style={styles.locationTitle}>Clock In Location</Text>
                <Text style={styles.locationText}>
                  {item.location.latitude.toFixed(6)}, {item.location.longitude.toFixed(6)}
                  {item.location.distance_km > 0 && (
                    <Text style={styles.distanceText}>
                      {" "}{item.location.distance_km.toFixed(2)} km from office
                    </Text>
                  )}
                </Text>
              </View>
            </View>
          )}
          
          {item.clock_out_location && (
            <View style={styles.locationContainer}>
              <View style={styles.locationIconContainer}>
                <Ionicons name="navigate-circle" size={16} color="#5856D6" />
              </View>
              <View style={styles.locationContent}>
                <Text style={styles.locationTitle}>Clock Out Location</Text>
                <Text style={styles.locationText}>
                  {item.clock_out_location.latitude.toFixed(6)}, {item.clock_out_location.longitude.toFixed(6)}
                  {item.clock_out_location.distance_km > 0 && (
                    <Text style={styles.distanceText}>
                      {" "}{item.clock_out_location.distance_km.toFixed(2)} km from office
                    </Text>
                  )}
                </Text>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );

  const getStatusStyle = (standing: string) => {
    if (!standing) return {};
    
    switch (standing.toLowerCase()) {
      case 'present':
        return styles.presentStatus;
      case 'absent':
        return styles.absentStatus;
      case 'late':
        return styles.lateStatus;
      default:
        return {};
    }
  };

  const getStatusTextStyle = (standing: string) => {
    if (!standing) return {};
    
    switch (standing.toLowerCase()) {
      case 'present':
        return styles.presentStatusText;
      case 'absent':
        return styles.absentStatusText;
      case 'late':
        return styles.lateStatusText;
      default:
        return {};
    }
  };

  const getStatusIconColor = (standing: string) => {
    if (!standing) return '#757575';
    
    switch (standing.toLowerCase()) {
      case 'present':
        return '#2e7d32';
      case 'absent':
        return '#c62828';
      case 'late':
        return '#ff8f00';
      default:
        return '#757575';
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading attendance history...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle" size={48} color="#FF3B30" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Attendance History</Text>
      </View>
      {historyData && historyData.length > 0 ? (
        <FlatList
          data={historyData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.centered}>
          <Ionicons name="calendar-clear" size={64} color="#8E8E93" />
          <Text style={styles.emptyText}>No attendance records found</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F2F2F7',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  titleContainer: {
    alignSelf: 'center',
    marginVertical: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#007AFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  date: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    overflow: 'hidden',
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  presentStatus: {
    backgroundColor: '#E8F5E9',
  },
  presentStatusText: {
    color: '#2e7d32',
  },
  absentStatus: {
    backgroundColor: '#FFEBEE',
  },
  absentStatusText: {
    color: '#c62828',
  },
  lateStatus: {
    backgroundColor: '#FFF8E1',
  },
  lateStatusText: {
    color: '#ff8f00',
  },
  hoursText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
  timeSection: {
    padding: 16,
    backgroundColor: 'white',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  timeIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  timeContent: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  notClockedOut: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FF3B30',
  },
  shiftStatus: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F2F2F7',
    marginVertical: 8,
    marginLeft: 44,
  },
  locationSection: {
    padding: 16,
    backgroundColor: '#F9F9FB',
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  locationContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  locationIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEEDF7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#5856D6',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 1,
  },
  locationContent: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#5856D6',
    marginBottom: 2,
  },
  locationText: {
    fontSize: 13,
    color: '#3C3C43',
    lineHeight: 18,
  },
  distanceText: {
    color: '#8E8E93',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8E8E93',
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
});
