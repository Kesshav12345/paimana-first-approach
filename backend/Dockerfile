FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copy application fat jar
COPY backend/target/paimana-backend-1.0.0.jar app.jar
COPY paimana_canonical.db /app/paimana_canonical.db

ENV SPRING_PROFILES_ACTIVE=default
ENV PYTHON_SERVICE_URL=http://ml-service:8000
ENV PORT=8080

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
