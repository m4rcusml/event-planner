import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MeetingCardProps {
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
}

const MeetingCard: React.FC<MeetingCardProps> = ({
  title,
  date,
  time,
  location,
  description,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>{title}</Text>
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.contentText}>
          <Text style={styles.label}>Data: </Text>
          <Text style={styles.value}>{date}</Text>
        </Text>
        <Text style={styles.contentText}>
          <Text style={styles.label}>Horário: </Text>
          <Text style={styles.value}>{time}</Text>
        </Text>
        <Text style={styles.contentText}>
          <Text style={styles.label}>Local: </Text>
          <Text style={styles.value}>{location}</Text>
        </Text>
        <Text style={styles.contentText}>
          <Text style={styles.label}>Descrição: </Text>
          <Text style={styles.value}>{description}</Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContainer: {
    backgroundColor: '#F9C4A1',
    padding: 10,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7D4427',
    textAlign: 'center',
  },
  contentContainer: {
    backgroundColor: '#FFFFFF',
    padding: 15,
  },
  contentText: {
    marginBottom: 8,
    fontSize: 15,
  },
  label: {
    fontWeight: 'bold',
    color: '#7D4427',
  },
  value: {
    color: '#5A5A5A',
  },
  valueHighlighted: {
    color: '#E06733',
  },
});

export default MeetingCard;