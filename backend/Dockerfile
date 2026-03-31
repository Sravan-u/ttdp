# Stage 1: Build the app
FROM maven:3.9.11-eclipse-temurin-21 AS build

# Set working directory
WORKDIR /app

# Copy all project files
COPY . .

# Build the project (skip tests if you want)
RUN mvn clean package -DskipTests

# Stage 2: Create a smaller runtime image
FROM openjdk:21-jdk-slim

WORKDIR /app

# Copy the built jar from the previous stage
COPY --from=build /app/target/*.jar app.jar

# Run the jar
CMD ["java", "-jar", "app.jar"]