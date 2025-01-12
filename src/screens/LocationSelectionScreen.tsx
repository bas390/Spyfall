import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Theme } from '../theme';
import { Button } from '../components/Button';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { locations, Location } from '../data/locations';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'LocationSelection'>;

type CategoryInfo = {
  title: string;
  icon: string;
};

const CATEGORIES: Record<string, CategoryInfo> = {
  education: { title: 'การศึกษา', icon: 'school' },
  entertainment: { title: 'ความบันเทิง', icon: 'game-controller' },
  business: { title: 'ธุรกิจ', icon: 'business' },
  public: { title: 'สถานที่ราชการ', icon: 'building' },
  transportation: { title: 'การขนส่ง', icon: 'train' },
};

export default function LocationSelectionScreen({ navigation, route }: Props) {
  const theme = useTheme() as Theme;
  const insets = useSafeAreaInsets();
  const [selectedLocations, setSelectedLocations] = useState<Set<number>>(new Set(locations.map((_, i) => i)));

  const toggleLocation = (index: number) => {
    const newSelected = new Set(selectedLocations);
    if (newSelected.has(index)) {
      if (newSelected.size > 1) {
        newSelected.delete(index);
      }
    } else {
      newSelected.add(index);
    }
    setSelectedLocations(newSelected);
  };

  const handleNext = () => {
    const selectedLocationsList = Array.from(selectedLocations).map(index => locations[index]);
    navigation.navigate('LocalGameSetup', {
      availableLocations: selectedLocationsList,
    });
  };

  // จัดกลุ่มสถานที่ตาม category
  const groupedLocations = locations.reduce((groups, location, index) => {
    const category = location.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push({ ...location, index });
    return groups;
  }, {} as Record<string, (Location & { index: number })[]>);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>เลือกสถานที่</Text>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={[styles.subtitle, { color: theme.colors.subText }]}>
          เลือกอย่างน้อย 1 สถานที่
        </Text>

        {Object.entries(groupedLocations).map(([category, categoryLocations]) => (
          <View key={category} style={[styles.card, { backgroundColor: theme.colors.card }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="map" size={24} color={theme.colors.primary} />
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                {category} ({categoryLocations.length})
              </Text>
            </View>

            <View style={styles.locationGrid}>
              {categoryLocations.map((location) => (
                <TouchableOpacity
                  key={location.index}
                  style={[
                    styles.locationItem,
                    { 
                      backgroundColor: selectedLocations.has(location.index) 
                        ? theme.colors.primary + '20'
                        : theme.colors.background,
                      borderColor: selectedLocations.has(location.index)
                        ? theme.colors.primary
                        : theme.colors.border,
                    },
                  ]}
                  onPress={() => toggleLocation(location.index)}
                >
                  <Text style={[styles.locationName, { color: theme.colors.text }]}>
                    {location.name}
                  </Text>
                  <Text style={[styles.locationRoles, { color: theme.colors.subText }]}>
                    {location.roles.length} บทบาท
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.footer, { 
        paddingBottom: insets.bottom || 16,
        backgroundColor: theme.colors.card,
      }]}>
        <Button
          title="ถัดไป"
          onPress={handleNext}
          style={styles.nextButton}
          leftIcon={<Ionicons name="arrow-forward" size={24} color="white" />}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 44,
    paddingHorizontal: 16,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 16,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  card: {
    borderRadius: 16,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  locationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  locationItem: {
    width: '48%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  locationRoles: {
    fontSize: 14,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  nextButton: {
    height: 56,
  },
}); 