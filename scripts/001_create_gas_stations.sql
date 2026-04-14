-- Create gas stations table for storing fuel price reports
CREATE TABLE IF NOT EXISTS gas_stations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_name TEXT NOT NULL,
  fuel_type TEXT NOT NULL CHECK (fuel_type IN ('regular', 'high_octane', 'diesel')),
  price DECIMAL(10, 2) NOT NULL,
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for geospatial queries
CREATE INDEX IF NOT EXISTS idx_gas_stations_location ON gas_stations (latitude, longitude);

-- Create index for sorting by price
CREATE INDEX IF NOT EXISTS idx_gas_stations_price ON gas_stations (price);

-- Create index for fuel type filtering
CREATE INDEX IF NOT EXISTS idx_gas_stations_fuel_type ON gas_stations (fuel_type);

-- Enable Row Level Security
ALTER TABLE gas_stations ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read gas station data (public price info)
CREATE POLICY "Allow public read access" ON gas_stations FOR SELECT USING (true);

-- Allow anyone to insert new price reports (anonymous submissions)
CREATE POLICY "Allow public insert access" ON gas_stations FOR INSERT WITH CHECK (true);
