import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../theme';
import { Button } from './Button';

type Message = {
  id: string;
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  question: string;
  answer?: 'yes' | 'no' | 'maybe' | 'sometimes';
  timestamp: number;
};

type Props = {
  players: Array<{
    id: string;
    name: string;
  }>;
  currentPlayerId: string;
  currentPlayerName: string;
  currentTurnPlayerId: string;
  messages: Message[];
  onAskQuestion: (toId: string, question: string) => void;
  onAnswer: (messageId: string, answer: Message['answer']) => void;
  theme: Theme;
};

export default function QuestionChat({
  players,
  currentPlayerId,
  currentPlayerName,
  currentTurnPlayerId,
  messages,
  onAskQuestion,
  onAnswer,
  theme,
}: Props) {
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [question, setQuestion] = useState('');

  const isMyTurn = currentPlayerId === currentTurnPlayerId;
  const lastMessage = messages[messages.length - 1];
  const waitingForMyAnswer = lastMessage && !lastMessage.answer && lastMessage.toId === currentPlayerId;

  const handleAskQuestion = () => {
    if (!selectedPlayerId || !question.trim()) return;
    onAskQuestion(selectedPlayerId, question.trim());
    setQuestion('');
    setSelectedPlayerId('');
  };

  const renderAnswer = (message: Message) => {
    if (!message.answer) {
      if (message.toId === currentPlayerId) {
        return (
          <View style={styles.answerButtons}>
            <Button
              title="ใช่"
              onPress={() => onAnswer(message.id, 'yes')}
              style={[styles.answerButton, { backgroundColor: theme.colors.success }]}
            />
            <Button
              title="ไม่"
              onPress={() => onAnswer(message.id, 'no')}
              style={[styles.answerButton, { backgroundColor: theme.colors.error }]}
            />
            <Button
              title="บางครั้ง"
              onPress={() => onAnswer(message.id, 'sometimes')}
              style={[styles.answerButton, { backgroundColor: theme.colors.warning }]}
            />
            <Button
              title="อาจจะ"
              onPress={() => onAnswer(message.id, 'maybe')}
              style={[styles.answerButton, { backgroundColor: theme.colors.info }]}
            />
          </View>
        );
      }
      return <Text style={[styles.waiting, { color: theme.colors.subText }]}>กำลังรอคำตอบ...</Text>;
    }

    return (
      <Text style={[styles.answer, { 
        color: theme.colors.text,
        backgroundColor: 
          message.answer === 'yes' ? theme.colors.success :
          message.answer === 'no' ? theme.colors.error :
          theme.colors.border
      }]}>
        {
          message.answer === 'yes' ? 'ใช่' :
          message.answer === 'no' ? 'ไม่' :
          message.answer === 'sometimes' ? 'บางครั้ง' :
          'อาจจะ'
        }
      </Text>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.messages}>
        {messages.map((message) => (
          <View 
            key={message.id}
            style={[
              styles.messageContainer,
              message.fromId === currentPlayerId ? styles.myMessage : styles.otherMessage
            ]}
          >
            <View style={styles.messageHeader}>
              <Text style={[styles.playerName, { color: theme.colors.primary }]}>
                {message.fromName} ถาม {message.toName}
              </Text>
              <Text style={[styles.timestamp, { color: theme.colors.subText }]}>
                {new Date(message.timestamp).toLocaleTimeString()}
              </Text>
            </View>
            <Text style={[styles.question, { color: theme.colors.text }]}>
              {message.question}
            </Text>
            {renderAnswer(message)}
          </View>
        ))}
      </ScrollView>

      {isMyTurn && !waitingForMyAnswer && (
        <View style={styles.inputContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.playerList}
          >
            {players
              .filter(p => p.id !== currentPlayerId)
              .map(player => (
                <TouchableOpacity
                  key={player.id}
                  onPress={() => setSelectedPlayerId(player.id)}
                  style={[
                    styles.playerButton,
                    selectedPlayerId === player.id && { 
                      backgroundColor: theme.colors.primary 
                    }
                  ]}
                >
                  <Text style={[
                    styles.playerButtonText,
                    selectedPlayerId === player.id && { color: 'white' }
                  ]}>
                    {player.name}
                  </Text>
                </TouchableOpacity>
              ))}
          </ScrollView>

          <View style={styles.questionInput}>
            <TextInput
              value={question}
              onChangeText={setQuestion}
              placeholder="พิมพ์คำถามที่นี่..."
              placeholderTextColor={theme.colors.subText}
              style={[styles.input, { 
                color: theme.colors.text,
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              }]}
            />
            <Button
              title="ถาม"
              onPress={handleAskQuestion}
              disabled={!selectedPlayerId || !question.trim()}
              style={styles.askButton}
              leftIcon={<Ionicons name="send" size={24} color="white" />}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messages: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
    maxWidth: '80%',
  },
  myMessage: {
    alignSelf: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  playerName: {
    fontSize: 14,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 12,
  },
  question: {
    fontSize: 16,
    marginBottom: 8,
  },
  answer: {
    fontSize: 14,
    fontWeight: '600',
    padding: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  waiting: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  inputContainer: {
    padding: 16,
    borderTopWidth: 1,
  },
  playerList: {
    marginBottom: 12,
  },
  playerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  playerButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  questionInput: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  askButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  answerButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  answerButton: {
    flex: 1,
    minWidth: '45%',
  },
}); 