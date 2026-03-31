# Use Java 17 base image
FROM openjdk:17-jdk-slim

# Set working directory
WORKDIR /app

# Copy Maven wrapper (optional but good practice)
COPY backend/mvnw .
COPY backend/.mvn .mvn

# Copy pom.xml and download dependencies first (faster builds)
COPY backend/pom.xml .
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline

# Copy source code
COPY backend/src src

# Build the application
RUN ./mvnw clean package -DskipTests

# Expose Spring Boot port
EXPOSE 8080

# Run the jar
CMD ["java", "-jar", "target/*.jar"]