# UAD Network Audio Routing Setup
## MacBook Pro → M2 Ultra

### Method 1: Built-in macOS Audio Network

#### On MacBook Pro (UAD Host):
1. Open **Audio MIDI Setup** 
2. Window → Show Network Device Browser
3. Click "+" to create new session
4. Name it "UAD to M2 Ultra"
5. Enable "Advertise session on Bonjour"
6. In Audio MIDI Setup main window:
   - Create Aggregate Device
   - Add UAD interface + Network Device

#### On M2 Ultra (Receiver):
1. Open **Audio MIDI Setup**
2. Network Device Browser → Connect to "UAD to M2 Ultra"
3. Set as input device in your DAW

### Method 2: Loopback + BlackHole

#### Install on both Macs:
```bash
# BlackHole virtual audio driver
brew install blackhole-2ch

# Loopback for advanced routing
# Download from: https://rogueamoeba.com/loopback/
```

#### MacBook Pro Setup:
1. Loopback: UAD inputs → BlackHole 2ch
2. Stream via:
   - OBS with NDI plugin
   - Source-Connect Now
   - AudioMovers

#### M2 Ultra Setup:
1. Receive stream as input
2. Route to your DAW/Console software

### Method 3: Dante Virtual Soundcard

#### Requirements:
- Ethernet connection between Macs
- Dante Virtual Soundcard license ($30)

#### Setup:
1. Install Dante VSC on both Macs
2. MacBook Pro: Route UAD → Dante transmit
3. M2 Ultra: Dante receive → DAW input
4. Configure sample rate/buffer to match

### Latency Expectations:
- Network Audio: 5-20ms
- Dante: 4-10ms  
- BlackHole local: <1ms
- Hardware ADAT: 0ms

### Pro Tips:
- Use wired ethernet for stability
- Match sample rates (48kHz recommended)
- Disable WiFi on ethernet port
- Set consistent buffer sizes
