import { Dimensions, StyleSheet } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CALENDAR_PADDING = 8;
const CELL_SIZE = (SCREEN_WIDTH - 120 - (CALENDAR_PADDING * 2)) / 7;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    backgroundColor: '#fffc',
    margin: 16,
    padding: 16,
    borderRadius: 20,
    gap: 10
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#BEBEBE77',
    borderRadius: 15,
    alignItems: 'center',
    height: 40,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 16,
    color: '#333',
  },
  searchIcon: {
    padding: 10,
  },
  searchIconText: {
    fontSize: 18,
    color: '#FF914D',
  },
  calendarContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    padding: CALENDAR_PADDING,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#D7592E'
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
  },
  weekDayCell: {
    width: CELL_SIZE,
    alignItems: 'center',
  },
  weekDayText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  calendarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  calendarDay: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarDayText: {
    fontSize: 16,
    color: '#333',
  },
  todayCell: {
    backgroundColor: '#FF914D',
    borderRadius: CELL_SIZE / 2,
  },
  todayText: {
    color: '#fff',
    fontWeight: '600',
  },
  monthSelector: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  monthYearText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF914D',
  },
  monthHint: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FF914D',
    borderRadius: 6,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },
  buttonIconContainer: {
    marginRight: 6,
  },
  buttonPlusIcon: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    height: 40,
    borderWidth: 1,
    borderColor: '#FF914D',
  },
  secondaryButtonIconContainer: {
    marginRight: 6,
  },
  secondaryButtonText: {
    color: '#FF914D',
    fontSize: 12,
    fontWeight: '600',
  },
  remindersContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#D7592E'
  },
  remindersHeader: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  reminderHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  reminderTitleHeader: {
    flex: 3,
  },
  reminderDayHeader: {
    flex: 1,
    textAlign: 'center',
  },
  reminderTimeHeader: {
    flex: 1,
    textAlign: 'center',
  },
  reminderItem: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFEEE8',
  },
  reminderText: {
    fontSize: 12,
    color: '#FF914D',
  },
  reminderTitle: {
    flex: 3,
  },
  reminderDay: {
    flex: 1,
    textAlign: 'center',
  },
  reminderTime: {
    flex: 1,
    textAlign: 'center',
  },
  buttonContainer: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  squaredButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
