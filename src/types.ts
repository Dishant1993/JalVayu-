export interface WeatherFeed {
  precipitation_intensity: string;
  waterlogging_risk_score: number; // 1 to 10
  transit_delays_reported: string;
}

export interface InputContext {
  persona: string;
  vulnerable_assets: string[];
  start_location: string;
  destination: string;
  transport_mode: string;
  budget_buffer_inr: number;
  weather_feed: WeatherFeed;
}

export interface SafetyRoadmap {
  status: "GO" | "CAUTION" | "STAY_PUT";
  packing_directive: string;
  commute_strategy: string;
  critical_alert: string;
}
