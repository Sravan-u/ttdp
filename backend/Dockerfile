# =========================
# Stage 1: Build the Spring Boot app
# =========================
FROM maven:3.9.11-eclipse-temurin-21 AS build

# Set working directory
WORKDIR /app

# Copy only pom.xml first for caching dependencies
COPY pom.xml .

# Download dependencies only (faster rebuilds)
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the project, skipping tests
RUN mvn clean package -DskipTests

# =========================
# Stage 2: Create lightweight runtime image
# =========================
FROM eclipse-temurin:21-jdk-jammy

# Set working directory
WORKDIR /app

# Copy the built jar from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose the default Spring Boot port
EXPOSE 8080

# Run the Spring Boot application
CMD ["java", "-jar", "app.jar"]