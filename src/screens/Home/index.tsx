import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { Calendar, Clock, MagnifyingGlass, Plus, UsersThree } from 'phosphor-react-native';
import { useNavigation } from '@react-navigation/native';
import { styles } from './styles';

// Calendar data
const weekDays = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
const months = [
  'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
  'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
];

// Mock data for reminders
const reminders = [
  { title: 'REUNIÃO DO TRABALHO', day: '22/02', time: '07:00' },
  { title: 'ANIVERSÁRIO DA ISIS', day: '25/02', time: '10:00' },
  { title: 'CASAMENTO DA MILENA', day: '30/02', time: '17:00' },
];

export function Home() {
  const navigation = useNavigation();
  const [month, setMonth] = useState('JANEIRO');
  const [year, setYear] = useState('2025');

  useEffect(() => {
    const currentDate = new Date();
    setMonth(months[currentDate.getMonth()]);
    setYear(currentDate.getFullYear().toString());
  }, []);

  const renderCalendarDay = (day: number) => {
    const today = new Date();
    const isToday = day === today.getDate() &&
      months[today.getMonth()] === month &&
      today.getFullYear().toString() === year;

    return (
      <TouchableOpacity
        style={[styles.calendarDay, isToday && styles.todayCell]}
        key={day}
      >
        <Text style={[styles.calendarDayText, isToday && styles.todayText]}>
          {day}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderCalendarGrid = () => {
    const cells = [];

    // Week days header
    cells.push(
      <View key="header" style={styles.weekDaysRow}>
        {weekDays.map((day, index) => (
          <View key={index} style={styles.weekDayCell}>
            <Text style={styles.weekDayText}>{day}</Text>
          </View>
        ))}
      </View>
    );

    // Get number of days in the selected month
    const monthIndex = months.indexOf(month);
    const daysInMonth = new Date(parseInt(year), monthIndex + 1, 0).getDate();

    // Get first day of the month
    const firstDay = new Date(parseInt(year), monthIndex, 1).getDay();

    // Calendar days - rows of 7 days
    let row = [];

    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
      row.push(<View key={`empty-${i}`} style={styles.calendarDay} />);
    }

    // Add the actual days
    for (let i = 1; i <= daysInMonth; i++) {
      row.push(renderCalendarDay(i));

      if (row.length === 7) {
        cells.push(
          <View key={`row-${Math.ceil(i / 7)}`} style={styles.calendarRow}>
            {row}
          </View>
        );
        row = [];
      }
    }

    // Add remaining empty cells if needed
    if (row.length > 0) {
      while (row.length < 7) {
        row.push(<View key={`empty-end-${row.length}`} style={styles.calendarDay} />);
      }
      cells.push(
        <View key="last-row" style={styles.calendarRow}>
          {row}
        </View>
      );
    }

    return cells;
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('@/assets/bg.png')}
        style={styles.backgroundImage}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 20 }}>
          <View style={styles.contentContainer}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Pesquisa"
                placeholderTextColor="#999"
              />
              <View style={styles.searchIcon}>
                <MagnifyingGlass size={20} color="#FF914D" weight="bold" />
              </View>
            </View>
            {/* Calendar */}
            <View style={styles.calendarContainer}>
              {renderCalendarGrid()}
              {/* Month/Year Selector */}
              <View style={styles.monthSelector}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TouchableOpacity onPress={() => {
                    const currentIndex = months.indexOf(month);
                    if (currentIndex > 0) {
                      setMonth(months[currentIndex - 1]);
                    } else {
                      setMonth(months[11]);
                      setYear((parseInt(year) - 1).toString());
                    }
                  }}>
                    <Text style={[styles.monthYearText, { marginRight: 10 }]}>◀</Text>
                  </TouchableOpacity>
                  <Text style={styles.monthYearText}>{month} / {year}</Text>
                  <TouchableOpacity onPress={() => {
                    const currentIndex = months.indexOf(month);
                    if (currentIndex < 11) {
                      setMonth(months[currentIndex + 1]);
                    } else {
                      setMonth(months[0]);
                      setYear((parseInt(year) + 1).toString());
                    }
                  }}>
                    <Text style={[styles.monthYearText, { marginLeft: 10 }]}>▶</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.monthHint}>Escolha o mês</Text>
              </View>
            </View>
            {/* Action Buttons - First Row */}
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity style={styles.primaryButton}>
                <View style={styles.buttonIconContainer}>
                  <Plus size={18} color="#FFF" weight="bold" />
                </View>
                <Text style={styles.buttonText}>CRIAR EVENTO</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryButton}>
                <View style={styles.buttonIconContainer}>
                  <UsersThree size={18} color="#FFF" weight="bold" />
                </View>
                <Text style={styles.buttonText}>CONVIDADOS</Text>
              </TouchableOpacity>
            </View>
            {/* Action Buttons - Second Row */}
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity style={styles.primaryButton}>
                <View style={styles.buttonIconContainer}>
                  <Calendar size={18} color="#FFF" weight="bold" />
                </View>
                <Text style={styles.buttonText}>MEUS EVENTOS</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryButton}>
                <View style={styles.buttonIconContainer}>
                  <Clock size={18} color="#FFF" weight="bold" />
                </View>
                <Text style={styles.buttonText}>EVENTOS ANTIGOS</Text>
              </TouchableOpacity>
            </View>
            {/* Reminders Section */}
            <View style={styles.remindersContainer}>
              {/* Reminders Header */}
              <View style={styles.remindersHeader}>
                <Text style={[styles.reminderHeaderText, styles.reminderTitleHeader]}>LEMBRETES</Text>
                <Text style={[styles.reminderHeaderText, styles.reminderDayHeader]}>DIA</Text>
                <Text style={[styles.reminderHeaderText, styles.reminderTimeHeader]}>HORA</Text>
              </View>
              {/* Reminders List */}
              {reminders.map((reminder, index) => (
                <View key={index} style={styles.reminderItem}>
                  <Text style={[styles.reminderText, styles.reminderTitle]}>{reminder.title}</Text>
                  <Text style={[styles.reminderText, styles.reminderDay]}>{reminder.day}</Text>
                  <Text style={[styles.reminderText, styles.reminderTime]}>{reminder.time}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
}
