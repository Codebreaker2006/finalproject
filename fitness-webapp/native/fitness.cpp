#include "fitness.h"
#include <iostream>
#include <sstream>
#include <stdexcept>

using namespace std;

User::User() :
    currentSex(Sex::male),
    currentActivityLevel(ActivityLevel::Sedentary),
    currentMealType(MealType::breakfast),
    currentExerciseCategory(ExerciseCategory::cardio),
    currentUnitSystem(UnitSystem::Metric),
    currentHeightUnit(HeightUnit::meter),
    currentWeightUnit(WeightUnit::kg),
    weight(0.0),
    height(0.0) {
}

User::User(double w, double h) :
    currentSex(Sex::male),
    currentActivityLevel(ActivityLevel::Sedentary),
    currentMealType(MealType::breakfast),
    currentExerciseCategory(ExerciseCategory::cardio),
    currentUnitSystem(UnitSystem::Metric),
    currentHeightUnit(HeightUnit::meter),
    currentWeightUnit(WeightUnit::kg),
    weight(w),
    height(h) {
}

double User::getWeight() const {
    return weight;
}

double User::getHeight() const {
    return height;
}

void User::setWeight(double newWeight) {
    weight = newWeight;
}

void User::setHeight(double newHeight) {
    height = newHeight;
}

Sex User::getCurrentSex() const {
    return currentSex;
}

ActivityLevel User::getCurrentActivity() const {
    return currentActivityLevel;
}

MealType User::getCurrentMeal() const {
    return currentMealType;
}

ExerciseCategory User::getCurrentExercise() const {
    return currentExerciseCategory;
}

UnitSystem User::getCurrentUnitSystem() const {
    return currentUnitSystem;
}

HeightUnit User::getHeightUnit() const {
    return currentHeightUnit;
}

WeightUnit User::getWeightUnit() const {
    return currentWeightUnit;
}

void User::setSex(Sex newSex) {
    currentSex = newSex;
}

void User::setActivityLevel(ActivityLevel newActivity) {
    currentActivityLevel = newActivity;
}

void User::setMealType(MealType newMeal) {
    currentMealType = newMeal;
}

void User::setExerciseLevel(ExerciseCategory newExercise) {
    currentExerciseCategory = newExercise;
}

void User::setUnitSystem(UnitSystem newUnit) {
    currentUnitSystem = newUnit;
}

void User::setHeightUnit(HeightUnit newHeightUnit) {
    currentHeightUnit = newHeightUnit;
}

void User::setWeightUnit(WeightUnit newWeightUnit) {
    currentWeightUnit = newWeightUnit;
}

string User::serialize() const {
    ostringstream out;
    out << static_cast<int>(currentSex) << ','
        << static_cast<int>(currentActivityLevel) << ','
        << static_cast<int>(currentMealType) << ','
        << static_cast<int>(currentExerciseCategory) << ','
        << static_cast<int>(currentUnitSystem) << ','
        << static_cast<int>(currentHeightUnit) << ','
        << static_cast<int>(currentWeightUnit) << ','
        << weight << ','
        << height;
    return out.str();
}

User User::deserialize(const string& data) {
    istringstream in(data);
    string field;
    int sexVal, activityVal, mealVal, exerciseVal, unitSystemVal, heightUnitVal, weightUnitVal;
    double w, h;

    auto nextInt = [&](int& out) {
        if (!getline(in, field, ',')) {
            throw invalid_argument("Malformed User data: missing field.");
        }
        out = stoi(field);
    };

    nextInt(sexVal);
    nextInt(activityVal);
    nextInt(mealVal);
    nextInt(exerciseVal);
    nextInt(unitSystemVal);
    nextInt(heightUnitVal);
    nextInt(weightUnitVal);

    if (!getline(in, field, ',')) throw invalid_argument("Malformed User data: missing weight.");
    w = stod(field);
    if (!getline(in, field, ',')) throw invalid_argument("Malformed User data: missing height.");
    h = stod(field);

    User user(w, h);
    user.setSex(static_cast<Sex>(sexVal));
    user.setActivityLevel(static_cast<ActivityLevel>(activityVal));
    user.setMealType(static_cast<MealType>(mealVal));
    user.setExerciseLevel(static_cast<ExerciseCategory>(exerciseVal));
    user.setUnitSystem(static_cast<UnitSystem>(unitSystemVal));
    user.setHeightUnit(static_cast<HeightUnit>(heightUnitVal));
    user.setWeightUnit(static_cast<WeightUnit>(weightUnitVal));
    return user;
}

BMIcalculatorMetric::BMIcalculatorMetric(double w, double h)
    : weight(w), height(h) {
}

double BMIcalculatorMetric::calculateBMI() const {
    if (height <= 0.0) {
        throw invalid_argument("Height must be greater than zero.");
    }
    return weight / (height * height);
}

BMIcalculatorImperial::BMIcalculatorImperial(double w, double hInches)
    : weight(w), heightInches(hInches) {
}

double BMIcalculatorImperial::calculateBMI() const {
    if (heightInches <= 0.0) {
        throw invalid_argument("Height in inches must be greater than zero.");
    }
    return (weight / (heightInches * heightInches)) * 703.0;
}

BMRcalculator::BMRcalculator(Sex s, double w, double h, int a)
    : sex(s), weight(w), height(h), age(a) {
}

double BMRcalculator::calculateBMR() const {
    if (weight <= 0.0 || height <= 0.0 || age <= 0) {
        throw invalid_argument("Weight, height, and age must be greater than zero.");
    }

    const double base = 10.0 * weight + 6.25 * (height * 100.0) - 5.0 * age;
    return base + (sex == Sex::male ? 5.0 : -161.0);
}

IdealWeightCalculator::IdealWeightCalculator(double heightInMeters)
    : heightInMeters(heightInMeters) {
}

double IdealWeightCalculator::calculateIdealWeight() const {
    if (heightInMeters <= 0.0) {
        throw invalid_argument("Height must be greater than zero.");
    }

    const double lowBmi = 18.5;
    const double highBmi = 24.9;

    double lowWeightKg = lowBmi * heightInMeters * heightInMeters;
    double highWeightKg = highBmi * heightInMeters * heightInMeters;

    return (lowWeightKg + highWeightKg) / 2.0;
}

int main() {
    int choice;
    cout << "Choose unit system (1 = Metric, 2 = Imperial): ";
    cin >> choice;

    User user;

    if (choice == 1) {
        user.setUnitSystem(UnitSystem::Metric);
        user.setHeightUnit(HeightUnit::meter);
        user.setWeightUnit(WeightUnit::kg);

        double weight, height;
        cout << "Enter weight (kg): ";
        cin >> weight;
        cout << "Enter height (m): ";
        cin >> height;

        user.setWeight(weight);
        user.setHeight(height);

        BMIcalculatorMetric calc(weight, height);
        cout << "Your BMI is: " << calc.calculateBMI() << endl;

        IdealWeightCalculator idealCalc(height);
        cout << "Your ideal weight is approximately: " << idealCalc.calculateIdealWeight() << " kg" << endl;
    }
    else {
        user.setUnitSystem(UnitSystem::Imperial);
        user.setHeightUnit(HeightUnit::ftin);
        user.setWeightUnit(WeightUnit::lbs);

        double weight, feet, inches;
        cout << "Enter weight (lbs): ";
        cin >> weight;
        cout << "Enter height (feet and inches, e.g. 5 7): ";
        cin >> feet >> inches;

        double totalInches = feet * 12.0 + inches;

        user.setWeight(weight);
        user.setHeight(totalInches);

        BMIcalculatorImperial calc(weight, totalInches);
        cout << "Your BMI is: " << calc.calculateBMI() << endl;

        double heightInMeters = totalInches * 0.0254;
        IdealWeightCalculator idealCalc(heightInMeters);
        double idealWeightKg = idealCalc.calculateIdealWeight();
        double idealWeightLbs = idealWeightKg * 2.20462;
        cout << "Your ideal weight is approximately: " << idealWeightLbs << " lbs" << endl;
    }

    return 0;
}
