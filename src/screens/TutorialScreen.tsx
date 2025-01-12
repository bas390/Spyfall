import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Theme } from '../theme';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Tutorial'>;

type TutorialStep = {
  title: string;
  description: string;
  icon: string;
};

const tutorialSteps: TutorialStep[] = [
  {
    title: 'วิธีการเล่น',
    description: 'Spyfall เป็นเกมปาร์ตี้ที่ผู้เล่นทุกคนจะได้รับบทบาทในสถานที่เดียวกัน ยกเว้นสายลับที่ไม่รู้ว่าตัวเองอยู่ที่ไหน',
    icon: 'information-circle',
  },
  {
    title: 'การเริ่มเกม',
    description: 'เลือกจำนวนผู้เล่น (3-12 คน) และจำนวนสายลับ (1-2 คน) จากนั้นระบบจะสุ่มสถานที่และบทบาทให้ผู้เล่นแต่ละคน',
    icon: 'play',
  },
  {
    title: 'การถามตอบ',
    description: 'ผู้เล่นจะผลัดกันถามคำถามเกี่ยวกับสถานที่ โดยสายลับต้องพยายามปกปิดตัวเองและหาว่าอยู่ที่ไหน ส่วนผู้เล่นอื่นต้องหาว่าใครเป็นสายลับ',
    icon: 'chatbubbles',
  },
  {
    title: 'การโหวต',
    description: 'เมื่อหมดเวลาหรือมีผู้เล่นขอโหวต ทุกคนจะได้โหวตว่าใครเป็นสายลับ ถ้าจับสายลับได้ ผู้เล่นชนะ แต่ถ้าสายลับทายสถานที่ถูกหรือจับผิดตัว สายลับชนะ',
    icon: 'checkmark-circle',
  },
  {
    title: 'เคล็ดลับ',
    description: '- ถามคำถามที่เกี่ยวข้องกับสถานที่\n- สังเกตคำตอบที่ผิดปกติ\n- อย่าถามคำถามที่เฉพาะเจาะจงเกินไปในตอนแรก\n- สายลับควรฟังคำตอบของคนอื่นเพื่อเดาสถานที่',
    icon: 'bulb',
  },
];

export default function TutorialScreen({ navigation }: Props) {
  const theme = useTheme() as Theme;
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigation.goBack();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          {tutorialSteps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                {
                  backgroundColor: index === currentStep ? theme.colors.primary : theme.colors.border,
                },
              ]}
            />
          ))}
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <Ionicons
            name={tutorialSteps[currentStep].icon as any}
            size={48}
            color={theme.colors.primary}
            style={styles.stepIcon}
          />
          <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
            {tutorialSteps[currentStep].title}
          </Text>
          <Text style={[styles.stepDescription, { color: theme.colors.subText }]}>
            {tutorialSteps[currentStep].description}
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.colors.card }]}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          onPress={handleNext}
        >
          <Text style={styles.buttonText}>
            {currentStep === tutorialSteps.length - 1 ? 'เริ่มเล่นเกม' : 'ถัดไป'}
          </Text>
          <Ionicons
            name={currentStep === tutorialSteps.length - 1 ? 'play' : 'arrow-forward'}
            size={24}
            color="white"
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  card: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  stepIcon: {
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  button: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
}); 