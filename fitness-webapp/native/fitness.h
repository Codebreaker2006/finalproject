#pragma once

#include <string>

enum class Sex {
    male,
    female
};

enum class ActivityLevel {
    Sedentary,
    light,
    moderate,
    active,
    veryactive
};

enum class MealType {
    breakfast,
    lunch,
    dinner,
    snack
};

enum class ExerciseCategory {
    cardio,
    strength,
    flexibility,
    sports
};

enum class UnitSystem {
    Metric,
    Imperial
};

enum class WeightUnit {
    kg,
    lbs
};

enum class HeightUnit {
    meter,
    ftin
};

class User {
private:
    Sex currentSex;
    ActivityLevel currentActivityLevel;
    MealType currentMealType;
    ExerciseCategory currentExerciseCategory;
    UnitSystem currentUnitSystem;
    HeightUnit currentHeightUnit;
    WeightUnit currentWeightUnit;
    double weight;
    double height;

public:
    User();
    User(double w, double h);

    double getWeight() const;
    double getHeight() const;
    void setWeight(double newWeight);
    void setHeight(double newHeight);

    Sex getCurrentSex() const;
    ActivityLevel getCurrentActivity() const;
    MealType getCurrentMeal() const;
    ExerciseCategory getCurrentExercise() const;
    UnitSystem getCurrentUnitSystem() const;
    HeightUnit getHeightUnit() const;
    WeightUnit getWeightUnit() const;

    void setSex(Sex newSex);
    void setActivityLevel(ActivityLevel newActivity);
    void setMealType(MealType newMeal);
    void setExerciseLevel(ExerciseCategory newExercise);
    void setUnitSystem(UnitSystem newUnit);
    void setHeightUnit(HeightUnit newHeightUnit);
    void setWeightUnit(WeightUnit newWeightUnit);

    // Minimal additions so a User's state can be saved and restored
    // (e.g. to a file or database row) instead of only living in memory.
    // Format: one comma-separated line of
    //   sex,activityLevel,mealType,exerciseCategory,unitSystem,heightUnit,weightUnit,weight,height
    // using each enum's underlying int value. This is the same set of
    // fields the webapp's Profile table persists per user.
    std::string serialize() const;
    static User deserialize(const std::string& data);
};

class BMIcalculatorMetric {
public:
    BMIcalculatorMetric(double w, double h);
    double calculateBMI() const;

private:
    double weight;
    double height;
};

class BMIcalculatorImperial {
public:
    BMIcalculatorImperial(double w, double hInches);
    double calculateBMI() const;

private:
    double weight;
    double heightInches;
};

class BMRcalculator {
public:
    BMRcalculator(Sex s, double w, double h, int a);
    double calculateBMR() const;

private:
    Sex sex;
    double weight;
    double height;
    int age;
};

class IdealWeightCalculator {
public:
    IdealWeightCalculator(double heightInMeters);
    double calculateIdealWeight() const;

private:
    double heightInMeters;
};
