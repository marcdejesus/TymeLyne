import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput as RNTextInput } from 'react-native';
import { Card, Button, TextInput, Chip, HelperText, Divider, IconButton, RadioButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Feather';
import { Goal } from './GoalCard';

interface SuggestedGoal {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
}

interface GoalCreationFormProps {
  onSubmit: (goal: Partial<Goal>) => void;
  onCancel: () => void;
  suggestedGoals?: SuggestedGoal[];
  isAdvancedMode?: boolean;
}

const GoalCreationForm = ({ 
  onSubmit, 
  onCancel, 
  suggestedGoals = [],
  isAdvancedMode = false
}: GoalCreationFormProps) => {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [currentState, setCurrentState] = useState('');
  const [successState, setSuccessState] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(isAdvancedMode);
  
  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onCancel();
    }
  };

  const handleSubmit = () => {
    const newGoal: Partial<Goal> = {
      title,
      description,
      priority,
      dueDate: targetDate,
      tags,
      progress: 0,
    };
    onSubmit(newGoal);
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    const newTags = [...tags];
    newTags.splice(index, 1);
    setTags(newTags);
  };

  const selectSuggestedGoal = (goal: SuggestedGoal) => {
    setTitle(goal.title);
    setDescription(goal.description);
    setStep(2);
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Choose your goal</Text>
      <Text style={styles.stepDescription}>
        Do you have a certain goal in mind you want to work on with your coach and community?
      </Text>
      
      <Card style={styles.inputCard}>
        <Card.Content>
          <TextInput
            label="What is your big goal?"
            value={title}
            onChangeText={setTitle}
            mode="outlined"
            style={styles.input}
            outlineColor="#6200ee"
            activeOutlineColor="#6200ee"
          />
          <HelperText type="info">
            Make sure your goal is SMART - Specific, Measurable, Achievable, Relevant, and Time-Bound.
          </HelperText>
        </Card.Content>
      </Card>
      
      <Text style={styles.suggestedTitle}>Popular Goals</Text>
      <ScrollView horizontal style={styles.suggestedScroll} showsHorizontalScrollIndicator={false}>
        {suggestedGoals.map((goal) => (
          <TouchableOpacity key={goal.id} onPress={() => selectSuggestedGoal(goal)}>
            <Card style={styles.suggestedCard}>
              <Card.Content style={styles.suggestedContent}>
                <View style={styles.iconContainer}>
                  <Icon name={goal.icon} size={24} color="#6200ee" />
                </View>
                <Text style={styles.suggestedName}>{goal.title}</Text>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        ))}
        <TouchableOpacity>
          <Card style={[styles.suggestedCard, styles.customCard]}>
            <Card.Content style={styles.suggestedContent}>
              <View style={styles.iconContainer}>
                <Icon name="edit-2" size={24} color="#6200ee" />
              </View>
              <Text style={styles.suggestedName}>Customize my own</Text>
            </Card.Content>
          </Card>
        </TouchableOpacity>
      </ScrollView>
      
      <View style={styles.buttonContainer}>
        <Button 
          mode="outlined" 
          onPress={onCancel} 
          style={styles.button}
          textColor="#6200ee"
        >
          Cancel
        </Button>
        <Button 
          mode="contained" 
          onPress={handleNext} 
          style={styles.button}
          buttonColor="#6200ee"
          disabled={!title}
        >
          Next
        </Button>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Describe Your Big Goal</Text>
      
      <Card style={styles.inputCard}>
        <Card.Content>
          <TextInput
            label="What is your big goal?"
            value={title}
            onChangeText={setTitle}
            mode="outlined"
            style={styles.input}
            outlineColor="#6200ee"
            activeOutlineColor="#6200ee"
          />
          
          <TextInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            multiline
            numberOfLines={4}
            style={[styles.input, styles.textArea]}
            outlineColor="#6200ee"
            activeOutlineColor="#6200ee"
          />
        </Card.Content>
      </Card>
      
      <Card style={styles.inputCard}>
        <Card.Content>
          <Text style={styles.inputLabel}>What's your current state?</Text>
          <RNTextInput
            value={currentState}
            onChangeText={setCurrentState}
            style={styles.plainInput}
            placeholder="Describe where you are now..."
            multiline
            numberOfLines={3}
          />
        </Card.Content>
      </Card>
      
      <View style={styles.buttonContainer}>
        <Button 
          mode="outlined" 
          onPress={handlePrevious} 
          style={styles.button}
          textColor="#6200ee"
        >
          Back
        </Button>
        <Button 
          mode="contained" 
          onPress={handleNext} 
          style={styles.button}
          buttonColor="#6200ee"
        >
          Next
        </Button>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Define Success</Text>
      
      <Card style={styles.inputCard}>
        <Card.Content>
          <Text style={styles.inputLabel}>What does success look like for you?</Text>
          <RNTextInput
            value={successState}
            onChangeText={setSuccessState}
            style={styles.plainInput}
            placeholder="How will you know when you've succeeded?"
            multiline
            numberOfLines={3}
          />
        </Card.Content>
      </Card>
      
      <Card style={styles.inputCard}>
        <Card.Content>
          <Text style={styles.inputLabel}>And do you have a target date?</Text>
          <RNTextInput
            value={targetDate}
            onChangeText={setTargetDate}
            style={styles.plainInput}
            placeholder="mm/dd/yyyy"
          />
          <HelperText type="info">
            A deadline helps you stay accountable and motivated.
          </HelperText>
        </Card.Content>
      </Card>
      
      {showAdvanced && (
        <Card style={styles.inputCard}>
          <Card.Content>
            <Text style={styles.inputLabel}>Priority Level</Text>
            <RadioButton.Group onValueChange={(value) => setPriority(value as 'LOW' | 'MEDIUM' | 'HIGH')} value={priority}>
              <View style={styles.radioOption}>
                <RadioButton value="HIGH" color="#6200ee" />
                <Text style={styles.radioLabel}>High</Text>
              </View>
              <View style={styles.radioOption}>
                <RadioButton value="MEDIUM" color="#6200ee" />
                <Text style={styles.radioLabel}>Medium</Text>
              </View>
              <View style={styles.radioOption}>
                <RadioButton value="LOW" color="#6200ee" />
                <Text style={styles.radioLabel}>Low</Text>
              </View>
            </RadioButton.Group>
          </Card.Content>
        </Card>
      )}
      
      <View style={styles.advancedToggle}>
        <TouchableOpacity onPress={() => setShowAdvanced(!showAdvanced)}>
          <Text style={styles.advancedText}>
            {showAdvanced ? 'Hide advanced options' : 'Show advanced options'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.buttonContainer}>
        <Button 
          mode="outlined" 
          onPress={handlePrevious} 
          style={styles.button}
          textColor="#6200ee"
        >
          Back
        </Button>
        <Button 
          mode="contained" 
          onPress={handleNext} 
          style={styles.button}
          buttonColor="#6200ee"
        >
          Next
        </Button>
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Categorize Your Goal</Text>
      
      {showAdvanced && (
        <Card style={styles.inputCard}>
          <Card.Content>
            <Text style={styles.inputLabel}>Add Tags</Text>
            <View style={styles.tagInputContainer}>
              <TextInput
                value={newTag}
                onChangeText={setNewTag}
                mode="outlined"
                style={styles.tagInput}
                placeholder="Enter a tag"
                outlineColor="#6200ee"
                activeOutlineColor="#6200ee"
                right={
                  <TextInput.Icon 
                    icon="plus" 
                    onPress={addTag} 
                    disabled={!newTag.trim()}
                  />
                }
              />
            </View>
            
            <View style={styles.tagsContainer}>
              {tags.map((tag, index) => (
                <Chip 
                  key={index} 
                  onClose={() => removeTag(index)}
                  style={styles.tag}
                  textStyle={styles.tagText}
                >
                  {tag}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>
      )}
      
      <Card style={styles.summaryCard}>
        <Card.Content>
          <Text style={styles.summaryTitle}>Goal Summary</Text>
          <Divider style={styles.divider} />
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Title:</Text>
            <Text style={styles.summaryText}>{title}</Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Description:</Text>
            <Text style={styles.summaryText}>{description || 'Not provided'}</Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Current State:</Text>
            <Text style={styles.summaryText}>{currentState || 'Not provided'}</Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Success Looks Like:</Text>
            <Text style={styles.summaryText}>{successState || 'Not provided'}</Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Target Date:</Text>
            <Text style={styles.summaryText}>{targetDate || 'Not provided'}</Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Priority:</Text>
            <View style={[styles.priorityBadge, 
              priority === 'HIGH' ? styles.highPriority : 
              priority === 'MEDIUM' ? styles.mediumPriority : 
              styles.lowPriority
            ]}>
              <Text style={styles.priorityText}>{priority}</Text>
            </View>
          </View>
          
          {tags.length > 0 && (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Tags:</Text>
              <View style={styles.summaryTags}>
                {tags.map((tag, index) => (
                  <Chip key={index} style={styles.summaryTag}>
                    {tag}
                  </Chip>
                ))}
              </View>
            </View>
          )}
        </Card.Content>
      </Card>
      
      <View style={styles.buttonContainer}>
        <Button 
          mode="outlined" 
          onPress={handlePrevious} 
          style={styles.button}
          textColor="#6200ee"
        >
          Back
        </Button>
        <Button 
          mode="contained" 
          onPress={handleSubmit} 
          style={styles.button}
          buttonColor="#6200ee"
        >
          Create Goal
        </Button>
      </View>
    </View>
  );

  // Render different steps based on current step
  const renderStep = () => {
    switch (step) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return renderStep1();
    }
  };

  // Render step indicators
  const renderStepIndicators = () => (
    <View style={styles.stepIndicatorContainer}>
      {[1, 2, 3, 4].map((s) => (
        <View 
          key={s} 
          style={[
            styles.stepIndicator, 
            s === step ? styles.activeStepIndicator : {},
            s < step ? styles.completedStepIndicator : {},
          ]}
        />
      ))}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {renderStepIndicators()}
      {renderStep()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 16,
  },
  stepIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 4,
  },
  activeStepIndicator: {
    backgroundColor: '#6200ee',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  completedStepIndicator: {
    backgroundColor: '#6200ee',
    opacity: 0.7,
  },
  stepContainer: {
    padding: 16,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  stepDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  inputCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  input: {
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 100,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
  suggestedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 16,
    color: '#333',
  },
  suggestedScroll: {
    marginBottom: 24,
  },
  suggestedCard: {
    width: 160,
    marginRight: 12,
    borderRadius: 12,
  },
  customCard: {
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#6200ee',
    backgroundColor: 'rgba(98, 0, 238, 0.05)',
  },
  suggestedContent: {
    alignItems: 'center',
    padding: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  suggestedName: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    color: '#333',
  },
  tagInputContainer: {
    marginBottom: 8,
  },
  tagInput: {
    backgroundColor: '#fff',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
  },
  tagText: {
    color: '#6200ee',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  plainInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 10,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
    textAlignVertical: 'top',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  radioLabel: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
  advancedToggle: {
    alignItems: 'center',
    marginVertical: 16,
  },
  advancedText: {
    color: '#6200ee',
    fontWeight: '500',
  },
  summaryCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  divider: {
    marginBottom: 16,
  },
  summaryItem: {
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 16,
    color: '#333',
  },
  summaryTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  summaryTag: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  highPriority: {
    backgroundColor: 'rgba(229, 57, 53, 0.1)',
  },
  mediumPriority: {
    backgroundColor: 'rgba(251, 140, 0, 0.1)',
  },
  lowPriority: {
    backgroundColor: 'rgba(67, 160, 71, 0.1)',
  },
  priorityText: {
    fontWeight: 'bold',
  },
});

export default GoalCreationForm; 