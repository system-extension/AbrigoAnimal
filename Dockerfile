# Imagem de produção em estágios (multi-stage).
# A imagem final leva só a JRE + o .jar: sem Maven, sem Node, sem código-fonte.

# ---------------------------------------------------------------------------
# Estágio 1 — frontend (build do React)
# ---------------------------------------------------------------------------
FROM node:22-alpine AS frontend
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ---------------------------------------------------------------------------
# Estágio 2 — backend
# ---------------------------------------------------------------------------
FROM maven:3.9-eclipse-temurin-25 AS backend
WORKDIR /app
COPY backend/pom.xml ./
RUN mvn -B -q dependency:go-offline
COPY backend/src ./src
# Embute o build do React: o Spring entrega o site e a API no mesmo endereço (SpaConfig).
COPY --from=frontend /app/dist ./src/main/resources/static
RUN mvn -B -q package -DskipTests

# ---------------------------------------------------------------------------
# Estágio 3 — execução
# ---------------------------------------------------------------------------
FROM eclipse-temurin:25-jre-alpine
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app && mkdir -p /app/dados && chown app:app /app/dados
USER app
COPY --from=backend /app/target/*.jar app.jar
# Memória: a JVM usa no máximo 75% do limite do container (lição do Patudos).
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75 -XX:+UseSerialGC -Xss512k"
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
