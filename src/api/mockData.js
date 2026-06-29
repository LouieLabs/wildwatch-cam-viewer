// src/api/mockData.js
//
// 50 realistic mock captures for local development.
//
// SHAPE matches the CaptureCard in the WildWatch student guide (§04), including
// `temperatureF` and `humidityPercent`. All images are assumed 1920x1080 native
// resolution; bbox coords are in those pixel units — scale them when displaying
// the image smaller (see guide §04).
//
// Humidity values here are computed from time-of-day + temperature so they
// look weather-realistic for late-November Pacific NW (range ~54–96% RH). Real
// readings will come from a per-camera city weather lookup, then later an
// onboard sensor.
//
// imageUrl uses picsum.photos placeholder images keyed by a stable seed —
// the same seed always returns the same image, so layouts are predictable
// during development. Swap with real GCS URLs once the live pipeline is wired.
//
// Distribution (50 total):
//   deer     8   dawn / dusk · north_gate, garden_west, pond_cam_01
//   raccoon  10  late night · back_porch, pond_cam_01
//   squirrel 12  daytime · 4 from driveway_deterrent are PRIVATE
//   bird      9  daytime · all public cams
//   fox       4  night · scattered
//   coyote    3  night · scattered
//   possum    1  late evening · public
//   cat       1  evening · public
//   dog       2  daytime · PRIVATE (pet detections never go to public viewers)
//
// Time window: 2025-11-11 → 2025-11-20 (10 days)
// Private: 6  (4 deterrent-cam squirrels + 2 dogs)
// Public:  44

export const mockCameras = [
  { id: "north_gate",         name: "North Gate" },
  { id: "back_porch",         name: "Back Porch" },
  { id: "garden_west",        name: "Garden (West)" },
  { id: "pond_cam_01",        name: "Pond" },
  { id: "driveway_deterrent", name: "Driveway (Deterrent)" },
];

// Species list for the filter dropdown. "other" is a catch-all bucket — the
// pipeline may emit any of possum/cat/dog/etc. with the top-level species set
// to the specific label; group them in the UI under "Other".
export const mockSpecies = [
  "deer", "raccoon", "squirrel", "bird", "fox", "coyote", "possum", "cat", "dog",
];

export const mockCaptures = [
  // ==========================================================================
  // DEER (8) — dawn / dusk
  // ==========================================================================
  {
    id: "cap_20251120_064218_north_gate",
    imageUrl: "https://picsum.photos/seed/wildwatch_001/1920/1080",
    timestamp: "2025-11-20T06:42:18Z",
    cameraId: "north_gate",
    species: "deer",
    confidence: 0.94,
    temperatureF: 38,
    humidityPercent: 87,
    public: true,
    detections: [
      { label: "deer", confidence: 0.94, bbox: { x: 612, y: 380, w: 580, h: 640 } },
    ],
  },
  {
    id: "cap_20251119_172351_north_gate",
    imageUrl: "https://picsum.photos/seed/wildwatch_002/1920/1080",
    timestamp: "2025-11-19T17:23:51Z",
    cameraId: "north_gate",
    species: "deer",
    confidence: 0.91,
    temperatureF: 45,
    humidityPercent: 72,
    public: true,
    detections: [
      { label: "deer", confidence: 0.91, bbox: { x: 420, y: 350, w: 540, h: 620 } },
      { label: "deer", confidence: 0.87, bbox: { x: 1080, y: 380, w: 520, h: 600 } },
    ],
  },
  {
    id: "cap_20251119_070832_garden_west",
    imageUrl: "https://picsum.photos/seed/wildwatch_003/1920/1080",
    timestamp: "2025-11-19T07:08:32Z",
    cameraId: "garden_west",
    species: "deer",
    confidence: 0.96,
    temperatureF: 40,
    humidityPercent: 82,
    public: true,
    detections: [
      { label: "deer", confidence: 0.96, bbox: { x: 740, y: 310, w: 620, h: 720 } },
    ],
  },
  {
    id: "cap_20251117_175514_garden_west",
    imageUrl: "https://picsum.photos/seed/wildwatch_004/1920/1080",
    timestamp: "2025-11-17T17:55:14Z",
    cameraId: "garden_west",
    species: "deer",
    confidence: 0.89,
    temperatureF: 44,
    humidityPercent: 72,
    public: true,
    detections: [
      { label: "deer", confidence: 0.89, bbox: { x: 560, y: 420, w: 500, h: 560 } },
    ],
  },
  {
    id: "cap_20251116_063209_north_gate",
    imageUrl: "https://picsum.photos/seed/wildwatch_005/1920/1080",
    timestamp: "2025-11-16T06:32:09Z",
    cameraId: "north_gate",
    species: "deer",
    confidence: 0.97,
    temperatureF: 36,
    humidityPercent: 88,
    public: true,
    detections: [
      { label: "deer", confidence: 0.97, bbox: { x: 340, y: 360, w: 540, h: 640 } },
      { label: "deer", confidence: 0.93, bbox: { x: 900, y: 380, w: 500, h: 600 } },
      { label: "deer", confidence: 0.88, bbox: { x: 1440, y: 410, w: 420, h: 540 } },
    ],
  },
  {
    id: "cap_20251114_181142_garden_west",
    imageUrl: "https://picsum.photos/seed/wildwatch_006/1920/1080",
    timestamp: "2025-11-14T18:11:42Z",
    cameraId: "garden_west",
    species: "deer",
    confidence: 0.93,
    temperatureF: 43,
    humidityPercent: 78,
    public: true,
    detections: [
      { label: "deer", confidence: 0.93, bbox: { x: 680, y: 340, w: 580, h: 680 } },
    ],
  },
  {
    id: "cap_20251113_074255_north_gate",
    imageUrl: "https://picsum.photos/seed/wildwatch_007/1920/1080",
    timestamp: "2025-11-13T07:42:55Z",
    cameraId: "north_gate",
    species: "deer",
    confidence: 0.88,
    temperatureF: 41,
    humidityPercent: 82,
    public: true,
    detections: [
      { label: "deer", confidence: 0.88, bbox: { x: 720, y: 400, w: 480, h: 560 } },
      { label: "bird", confidence: 0.62, bbox: { x: 1480, y: 180, w: 140, h: 110 } },
    ],
  },
  {
    id: "cap_20251111_174830_pond_cam_01",
    imageUrl: "https://picsum.photos/seed/wildwatch_008/1920/1080",
    timestamp: "2025-11-11T17:48:30Z",
    cameraId: "pond_cam_01",
    species: "deer",
    confidence: 0.92,
    temperatureF: 46,
    humidityPercent: 72,
    public: true,
    detections: [
      { label: "deer", confidence: 0.92, bbox: { x: 480, y: 360, w: 560, h: 640 } },
      { label: "deer", confidence: 0.85, bbox: { x: 1100, y: 400, w: 480, h: 580 } },
    ],
  },

  // ==========================================================================
  // RACCOON (10) — late night
  // ==========================================================================
  {
    id: "cap_20251120_021544_back_porch",
    imageUrl: "https://picsum.photos/seed/wildwatch_009/1920/1080",
    timestamp: "2025-11-20T02:15:44Z",
    cameraId: "back_porch",
    species: "raccoon",
    confidence: 0.95,
    temperatureF: 38,
    humidityPercent: 95,
    public: true,
    detections: [
      { label: "raccoon", confidence: 0.95, bbox: { x: 780, y: 480, w: 420, h: 460 } },
    ],
  },
  {
    id: "cap_20251120_013318_pond_cam_01",
    imageUrl: "https://picsum.photos/seed/wildwatch_010/1920/1080",
    timestamp: "2025-11-20T01:33:18Z",
    cameraId: "pond_cam_01",
    species: "raccoon",
    confidence: 0.92,
    temperatureF: 37,
    humidityPercent: 93,
    public: true,
    detections: [
      { label: "raccoon", confidence: 0.92, bbox: { x: 540, y: 500, w: 400, h: 440 } },
      { label: "raccoon", confidence: 0.88, bbox: { x: 1080, y: 520, w: 380, h: 420 } },
    ],
  },
  {
    id: "cap_20251119_034822_back_porch",
    imageUrl: "https://picsum.photos/seed/wildwatch_011/1920/1080",
    timestamp: "2025-11-19T03:48:22Z",
    cameraId: "back_porch",
    species: "raccoon",
    confidence: 0.94,
    temperatureF: 35,
    humidityPercent: 94,
    public: true,
    detections: [
      { label: "raccoon", confidence: 0.94, bbox: { x: 860, y: 460, w: 440, h: 480 } },
    ],
  },
  {
    id: "cap_20251118_234211_pond_cam_01",
    imageUrl: "https://picsum.photos/seed/wildwatch_012/1920/1080",
    timestamp: "2025-11-18T23:42:11Z",
    cameraId: "pond_cam_01",
    species: "raccoon",
    confidence: 0.97,
    temperatureF: 40,
    humidityPercent: 91,
    public: true,
    detections: [
      { label: "raccoon", confidence: 0.97, bbox: { x: 720, y: 440, w: 500, h: 520 } },
    ],
  },
  {
    id: "cap_20251117_015538_back_porch",
    imageUrl: "https://picsum.photos/seed/wildwatch_013/1920/1080",
    timestamp: "2025-11-17T01:55:38Z",
    cameraId: "back_porch",
    species: "raccoon",
    confidence: 0.91,
    temperatureF: 36,
    humidityPercent: 94,
    public: true,
    detections: [
      { label: "raccoon", confidence: 0.91, bbox: { x: 380, y: 480, w: 380, h: 420 } },
      { label: "raccoon", confidence: 0.86, bbox: { x: 860, y: 500, w: 360, h: 400 } },
      { label: "raccoon", confidence: 0.79, bbox: { x: 1320, y: 540, w: 320, h: 380 } },
    ],
  },
  {
    id: "cap_20251115_221842_pond_cam_01",
    imageUrl: "https://picsum.photos/seed/wildwatch_014/1920/1080",
    timestamp: "2025-11-15T22:18:42Z",
    cameraId: "pond_cam_01",
    species: "raccoon",
    confidence: 0.93,
    temperatureF: 39,
    humidityPercent: 90,
    public: true,
    detections: [
      { label: "raccoon", confidence: 0.93, bbox: { x: 820, y: 460, w: 460, h: 500 } },
    ],
  },
  {
    id: "cap_20251114_023315_back_porch",
    imageUrl: "https://picsum.photos/seed/wildwatch_015/1920/1080",
    timestamp: "2025-11-14T02:33:15Z",
    cameraId: "back_porch",
    species: "raccoon",
    confidence: 0.96,
    temperatureF: 34,
    humidityPercent: 96,
    public: true,
    detections: [
      { label: "raccoon", confidence: 0.96, bbox: { x: 560, y: 460, w: 420, h: 460 } },
      { label: "raccoon", confidence: 0.90, bbox: { x: 1080, y: 500, w: 400, h: 440 } },
    ],
  },
  {
    id: "cap_20251113_031148_back_porch",
    imageUrl: "https://picsum.photos/seed/wildwatch_016/1920/1080",
    timestamp: "2025-11-13T03:11:48Z",
    cameraId: "back_porch",
    species: "raccoon",
    confidence: 0.89,
    temperatureF: 37,
    humidityPercent: 93,
    public: true,
    detections: [
      { label: "raccoon", confidence: 0.89, bbox: { x: 920, y: 500, w: 400, h: 440 } },
    ],
  },
  {
    id: "cap_20251112_012436_pond_cam_01",
    imageUrl: "https://picsum.photos/seed/wildwatch_017/1920/1080",
    timestamp: "2025-11-12T01:24:36Z",
    cameraId: "pond_cam_01",
    species: "raccoon",
    confidence: 0.95,
    temperatureF: 38,
    humidityPercent: 93,
    public: true,
    detections: [
      { label: "raccoon", confidence: 0.95, bbox: { x: 700, y: 480, w: 440, h: 480 } },
    ],
  },
  {
    id: "cap_20251111_234814_back_porch",
    imageUrl: "https://picsum.photos/seed/wildwatch_018/1920/1080",
    timestamp: "2025-11-11T23:48:14Z",
    cameraId: "back_porch",
    species: "raccoon",
    confidence: 0.92,
    temperatureF: 40,
    humidityPercent: 91,
    public: true,
    detections: [
      { label: "raccoon", confidence: 0.92, bbox: { x: 800, y: 460, w: 420, h: 460 } },
    ],
  },

  // ==========================================================================
  // SQUIRREL (12) — daytime
  //   4 from driveway_deterrent are PRIVATE
  // ==========================================================================
  {
    id: "cap_20251120_113342_driveway_deterrent",
    imageUrl: "https://picsum.photos/seed/wildwatch_019/1920/1080",
    timestamp: "2025-11-20T11:33:42Z",
    cameraId: "driveway_deterrent",
    species: "squirrel",
    confidence: 0.93,
    temperatureF: 52,
    humidityPercent: 63,
    public: false,
    detections: [
      { label: "squirrel", confidence: 0.93, bbox: { x: 880, y: 580, w: 220, h: 280 } },
    ],
  },
  {
    id: "cap_20251119_141508_driveway_deterrent",
    imageUrl: "https://picsum.photos/seed/wildwatch_020/1920/1080",
    timestamp: "2025-11-19T14:15:08Z",
    cameraId: "driveway_deterrent",
    species: "squirrel",
    confidence: 0.91,
    temperatureF: 54,
    humidityPercent: 54,
    public: false,
    detections: [
      { label: "squirrel", confidence: 0.91, bbox: { x: 620, y: 540, w: 200, h: 260 } },
      { label: "squirrel", confidence: 0.84, bbox: { x: 1180, y: 600, w: 180, h: 240 } },
    ],
  },
  {
    id: "cap_20251117_102251_driveway_deterrent",
    imageUrl: "https://picsum.photos/seed/wildwatch_021/1920/1080",
    timestamp: "2025-11-17T10:22:51Z",
    cameraId: "driveway_deterrent",
    species: "squirrel",
    confidence: 0.95,
    temperatureF: 50,
    humidityPercent: 67,
    public: false,
    detections: [
      { label: "squirrel", confidence: 0.95, bbox: { x: 940, y: 520, w: 240, h: 300 } },
    ],
  },
  {
    id: "cap_20251115_134833_driveway_deterrent",
    imageUrl: "https://picsum.photos/seed/wildwatch_022/1920/1080",
    timestamp: "2025-11-15T13:48:33Z",
    cameraId: "driveway_deterrent",
    species: "squirrel",
    confidence: 0.88,
    temperatureF: 53,
    humidityPercent: 57,
    public: false,
    detections: [
      { label: "squirrel", confidence: 0.88, bbox: { x: 760, y: 560, w: 220, h: 280 } },
    ],
  },
  {
    id: "cap_20251120_094218_garden_west",
    imageUrl: "https://picsum.photos/seed/wildwatch_023/1920/1080",
    timestamp: "2025-11-20T09:42:18Z",
    cameraId: "garden_west",
    species: "squirrel",
    confidence: 0.94,
    temperatureF: 47,
    humidityPercent: 71,
    public: true,
    detections: [
      { label: "squirrel", confidence: 0.94, bbox: { x: 880, y: 540, w: 240, h: 300 } },
    ],
  },
  {
    id: "cap_20251119_110855_garden_west",
    imageUrl: "https://picsum.photos/seed/wildwatch_024/1920/1080",
    timestamp: "2025-11-19T11:08:55Z",
    cameraId: "garden_west",
    species: "squirrel",
    confidence: 0.92,
    temperatureF: 50,
    humidityPercent: 64,
    public: true,
    detections: [
      { label: "squirrel", confidence: 0.92, bbox: { x: 720, y: 580, w: 200, h: 260 } },
    ],
  },
  {
    id: "cap_20251118_142311_back_porch",
    imageUrl: "https://picsum.photos/seed/wildwatch_025/1920/1080",
    timestamp: "2025-11-18T14:23:11Z",
    cameraId: "back_porch",
    species: "squirrel",
    confidence: 0.96,
    temperatureF: 53,
    humidityPercent: 55,
    public: true,
    detections: [
      { label: "squirrel", confidence: 0.96, bbox: { x: 640, y: 520, w: 220, h: 280 } },
      { label: "squirrel", confidence: 0.89, bbox: { x: 1180, y: 560, w: 200, h: 260 } },
    ],
  },
  {
    id: "cap_20251117_124538_north_gate",
    imageUrl: "https://picsum.photos/seed/wildwatch_026/1920/1080",
    timestamp: "2025-11-17T12:45:38Z",
    cameraId: "north_gate",
    species: "squirrel",
    confidence: 0.91,
    temperatureF: 51,
    humidityPercent: 60,
    public: true,
    detections: [
      { label: "squirrel", confidence: 0.91, bbox: { x: 900, y: 560, w: 220, h: 280 } },
    ],
  },
  {
    id: "cap_20251115_151822_garden_west",
    imageUrl: "https://picsum.photos/seed/wildwatch_027/1920/1080",
    timestamp: "2025-11-15T15:18:22Z",
    cameraId: "garden_west",
    species: "squirrel",
    confidence: 0.93,
    temperatureF: 54,
    humidityPercent: 56,
    public: true,
    detections: [
      { label: "squirrel", confidence: 0.93, bbox: { x: 1020, y: 540, w: 240, h: 300 } },
    ],
  },
  {
    id: "cap_20251113_113348_back_porch",
    imageUrl: "https://picsum.photos/seed/wildwatch_028/1920/1080",
    timestamp: "2025-11-13T11:33:48Z",
    cameraId: "back_porch",
    species: "squirrel",
    confidence: 0.89,
    temperatureF: 49,
    humidityPercent: 64,
    public: true,
    detections: [
      { label: "squirrel", confidence: 0.89, bbox: { x: 780, y: 580, w: 200, h: 260 } },
    ],
  },
  {
    id: "cap_20251112_135514_north_gate",
    imageUrl: "https://picsum.photos/seed/wildwatch_029/1920/1080",
    timestamp: "2025-11-12T13:55:14Z",
    cameraId: "north_gate",
    species: "squirrel",
    confidence: 0.95,
    temperatureF: 52,
    humidityPercent: 57,
    public: true,
    detections: [
      { label: "squirrel", confidence: 0.95, bbox: { x: 860, y: 540, w: 240, h: 300 } },
    ],
  },
  {
    id: "cap_20251111_100842_garden_west",
    imageUrl: "https://picsum.photos/seed/wildwatch_030/1920/1080",
    timestamp: "2025-11-11T10:08:42Z",
    cameraId: "garden_west",
    species: "squirrel",
    confidence: 0.94,
    temperatureF: 48,
    humidityPercent: 68,
    public: true,
    detections: [
      { label: "squirrel", confidence: 0.94, bbox: { x: 940, y: 560, w: 220, h: 280 } },
    ],
  },

  // ==========================================================================
  // BIRD (9) — daytime
  // ==========================================================================
  {
    id: "cap_20251120_081455_back_porch",
    imageUrl: "https://picsum.photos/seed/wildwatch_031/1920/1080",
    timestamp: "2025-11-20T08:14:55Z",
    cameraId: "back_porch",
    species: "bird",
    confidence: 0.87,
    temperatureF: 43,
    humidityPercent: 77,
    public: true,
    detections: [
      { label: "bird", confidence: 0.87, bbox: { x: 760, y: 320, w: 240, h: 220 } },
    ],
  },
  {
    id: "cap_20251120_134218_garden_west",
    imageUrl: "https://picsum.photos/seed/wildwatch_032/1920/1080",
    timestamp: "2025-11-20T13:42:18Z",
    cameraId: "garden_west",
    species: "bird",
    confidence: 0.92,
    temperatureF: 55,
    humidityPercent: 56,
    public: true,
    detections: [
      { label: "bird", confidence: 0.92, bbox: { x: 540, y: 280, w: 200, h: 180 } },
      { label: "bird", confidence: 0.84, bbox: { x: 1180, y: 360, w: 180, h: 160 } },
    ],
  },
  {
    id: "cap_20251119_093342_north_gate",
    imageUrl: "https://picsum.photos/seed/wildwatch_033/1920/1080",
    timestamp: "2025-11-19T09:33:42Z",
    cameraId: "north_gate",
    species: "bird",
    confidence: 0.85,
    temperatureF: 48,
    humidityPercent: 71,
    public: true,
    detections: [
      { label: "bird", confidence: 0.85, bbox: { x: 880, y: 340, w: 280, h: 240 } },
    ],
  },
  {
    id: "cap_20251118_075511_pond_cam_01",
    imageUrl: "https://picsum.photos/seed/wildwatch_034/1920/1080",
    timestamp: "2025-11-18T07:55:11Z",
    cameraId: "pond_cam_01",
    species: "bird",
    confidence: 0.91,
    temperatureF: 42,
    humidityPercent: 81,
    public: true,
    detections: [
      { label: "bird", confidence: 0.91, bbox: { x: 720, y: 380, w: 360, h: 280 } },
    ],
  },
  {
    id: "cap_20251117_152238_garden_west",
    imageUrl: "https://picsum.photos/seed/wildwatch_035/1920/1080",
    timestamp: "2025-11-17T15:22:38Z",
    cameraId: "garden_west",
    species: "bird",
    confidence: 0.78,
    temperatureF: 53,
    humidityPercent: 57,
    public: true,
    detections: [
      { label: "bird", confidence: 0.78, bbox: { x: 1120, y: 240, w: 180, h: 160 } },
    ],
  },
  {
    id: "cap_20251116_111833_back_porch",
    imageUrl: "https://picsum.photos/seed/wildwatch_036/1920/1080",
    timestamp: "2025-11-16T11:18:33Z",
    cameraId: "back_porch",
    species: "bird",
    confidence: 0.89,
    temperatureF: 51,
    humidityPercent: 64,
    public: true,
    detections: [
      { label: "bird", confidence: 0.89, bbox: { x: 840, y: 320, w: 240, h: 220 } },
    ],
  },
  {
    id: "cap_20251114_084825_pond_cam_01",
    imageUrl: "https://picsum.photos/seed/wildwatch_037/1920/1080",
    timestamp: "2025-11-14T08:48:25Z",
    cameraId: "pond_cam_01",
    species: "bird",
    confidence: 0.94,
    temperatureF: 44,
    humidityPercent: 76,
    public: true,
    detections: [
      { label: "bird", confidence: 0.94, bbox: { x: 460, y: 260, w: 200, h: 180 } },
      { label: "bird", confidence: 0.88, bbox: { x: 900, y: 320, w: 220, h: 200 } },
      { label: "bird", confidence: 0.82, bbox: { x: 1380, y: 280, w: 200, h: 180 } },
    ],
  },
  {
    id: "cap_20251113_145548_north_gate",
    imageUrl: "https://picsum.photos/seed/wildwatch_038/1920/1080",
    timestamp: "2025-11-13T14:55:48Z",
    cameraId: "north_gate",
    species: "bird",
    confidence: 0.81,
    temperatureF: 52,
    humidityPercent: 55,
    public: true,
    detections: [
      { label: "bird", confidence: 0.81, bbox: { x: 1020, y: 360, w: 260, h: 220 } },
    ],
  },
  {
    id: "cap_20251112_073322_garden_west",
    imageUrl: "https://picsum.photos/seed/wildwatch_039/1920/1080",
    timestamp: "2025-11-12T07:33:22Z",
    cameraId: "garden_west",
    species: "bird",
    confidence: 0.88,
    temperatureF: 41,
    humidityPercent: 82,
    public: true,
    detections: [
      { label: "bird", confidence: 0.88, bbox: { x: 760, y: 300, w: 280, h: 220 } },
    ],
  },

  // ==========================================================================
  // FOX (4) — night
  // ==========================================================================
  {
    id: "cap_20251119_234855_pond_cam_01",
    imageUrl: "https://picsum.photos/seed/wildwatch_040/1920/1080",
    timestamp: "2025-11-19T23:48:55Z",
    cameraId: "pond_cam_01",
    species: "fox",
    confidence: 0.91,
    temperatureF: 41,
    humidityPercent: 91,
    public: true,
    detections: [
      { label: "fox", confidence: 0.91, bbox: { x: 680, y: 440, w: 540, h: 460 } },
    ],
  },
  {
    id: "cap_20251117_023318_north_gate",
    imageUrl: "https://picsum.photos/seed/wildwatch_041/1920/1080",
    timestamp: "2025-11-17T02:33:18Z",
    cameraId: "north_gate",
    species: "fox",
    confidence: 0.88,
    temperatureF: 37,
    humidityPercent: 95,
    public: true,
    detections: [
      { label: "fox", confidence: 0.88, bbox: { x: 820, y: 480, w: 580, h: 460 } },
    ],
  },
  {
    id: "cap_20251115_011842_back_porch",
    imageUrl: "https://picsum.photos/seed/wildwatch_042/1920/1080",
    timestamp: "2025-11-15T01:18:42Z",
    cameraId: "back_porch",
    species: "fox",
    confidence: 0.93,
    temperatureF: 35,
    humidityPercent: 94,
    public: true,
    detections: [
      { label: "fox", confidence: 0.93, bbox: { x: 720, y: 460, w: 600, h: 480 } },
    ],
  },
  {
    id: "cap_20251112_225511_pond_cam_01",
    imageUrl: "https://picsum.photos/seed/wildwatch_043/1920/1080",
    timestamp: "2025-11-12T22:55:11Z",
    cameraId: "pond_cam_01",
    species: "fox",
    confidence: 0.85,
    temperatureF: 39,
    humidityPercent: 90,
    public: true,
    detections: [
      { label: "fox", confidence: 0.85, bbox: { x: 580, y: 500, w: 520, h: 440 } },
    ],
  },

  // ==========================================================================
  // COYOTE (3) — night
  // ==========================================================================
  {
    id: "cap_20251118_031148_north_gate",
    imageUrl: "https://picsum.photos/seed/wildwatch_044/1920/1080",
    timestamp: "2025-11-18T03:11:48Z",
    cameraId: "north_gate",
    species: "coyote",
    confidence: 0.89,
    temperatureF: 34,
    humidityPercent: 94,
    public: true,
    detections: [
      { label: "coyote", confidence: 0.89, bbox: { x: 620, y: 420, w: 700, h: 540 } },
    ],
  },
  {
    id: "cap_20251114_014233_garden_west",
    imageUrl: "https://picsum.photos/seed/wildwatch_045/1920/1080",
    timestamp: "2025-11-14T01:42:33Z",
    cameraId: "garden_west",
    species: "coyote",
    confidence: 0.92,
    temperatureF: 33,
    humidityPercent: 95,
    public: true,
    detections: [
      { label: "coyote", confidence: 0.92, bbox: { x: 380, y: 440, w: 640, h: 520 } },
      { label: "coyote", confidence: 0.84, bbox: { x: 1140, y: 460, w: 600, h: 500 } },
    ],
  },
  {
    id: "cap_20251111_034822_pond_cam_01",
    imageUrl: "https://picsum.photos/seed/wildwatch_046/1920/1080",
    timestamp: "2025-11-11T03:48:22Z",
    cameraId: "pond_cam_01",
    species: "coyote",
    confidence: 0.86,
    temperatureF: 36,
    humidityPercent: 94,
    public: true,
    detections: [
      { label: "coyote", confidence: 0.86, bbox: { x: 760, y: 460, w: 660, h: 520 } },
    ],
  },

  // ==========================================================================
  // OTHER — possum (1), cat (1), dog (2 · PRIVATE)
  // ==========================================================================
  {
    id: "cap_20251119_221855_back_porch",
    imageUrl: "https://picsum.photos/seed/wildwatch_047/1920/1080",
    timestamp: "2025-11-19T22:18:55Z",
    cameraId: "back_porch",
    species: "possum",
    confidence: 0.74,
    temperatureF: 42,
    humidityPercent: 89,
    public: true,
    detections: [
      { label: "possum", confidence: 0.74, bbox: { x: 840, y: 540, w: 360, h: 320 } },
    ],
  },
  {
    id: "cap_20251112_205542_garden_west",
    imageUrl: "https://picsum.photos/seed/wildwatch_048/1920/1080",
    timestamp: "2025-11-12T20:55:42Z",
    cameraId: "garden_west",
    species: "cat",
    confidence: 0.69,
    temperatureF: 44,
    humidityPercent: 84,
    public: true,
    detections: [
      { label: "cat", confidence: 0.69, bbox: { x: 920, y: 520, w: 340, h: 300 } },
    ],
  },
  {
    id: "cap_20251118_154233_back_porch",
    imageUrl: "https://picsum.photos/seed/wildwatch_049/1920/1080",
    timestamp: "2025-11-18T15:42:33Z",
    cameraId: "back_porch",
    species: "dog",
    confidence: 0.91,
    temperatureF: 54,
    humidityPercent: 56,
    public: false,
    detections: [
      { label: "dog", confidence: 0.91, bbox: { x: 700, y: 440, w: 600, h: 520 } },
    ],
  },
  {
    id: "cap_20251114_141855_garden_west",
    imageUrl: "https://picsum.photos/seed/wildwatch_050/1920/1080",
    timestamp: "2025-11-14T14:18:55Z",
    cameraId: "garden_west",
    species: "dog",
    confidence: 0.84,
    temperatureF: 52,
    humidityPercent: 55,
    public: false,
    detections: [
      { label: "dog", confidence: 0.84, bbox: { x: 780, y: 460, w: 560, h: 500 } },
    ],
  },
];

export default mockCaptures;
