// [go.mod dosyanızın başındaki module ve require satırları burada kalmalı]
// Örneğin:
// module github.com/FarukKuz/CareerBridge
// go 1.25.5 
// require ...

// === YEREL PAKETLER İÇİN replace YÖNERGELERİ ===

replace github.com/FarukKuz/CareerBridge/services/ingestion-service/pkg/api => ./web/backend/services/ingestion-service/pkg/api

replace github.com/FarukKuz/CareerBridge/services/ingestion-service/pkg/producer => ./web/backend/services/ingestion-service/pkg/producer

replace github.com/FarukKuz/CareerBridge/services/ingestion-service/pkg/dto => ./web/backend/services/ingestion-service/pkg/dto