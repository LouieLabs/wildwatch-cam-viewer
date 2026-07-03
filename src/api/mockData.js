// src/api/mockData.js
//
// 50 real trail-cam captures from the WPS-1 camera, uploaded to a public
// samples bucket so they load without auth for local dev and preview channels.
// (See LouieLabs/Wildlife-cam docs for how the samples bucket is set up.)
//
// SHAPE matches the CaptureCard in the WildWatch student guide §04, including
// `temperatureF` and `humidityPercent`. Images are 640x480 native resolution
// (UOVision trail cam), so bbox coords are in 640x480 — scale proportionally
// when displaying at any other size (see guide §04 for the math).
//
// Each photo has the UOVision timestamp footer baked in along the bottom
// (~40px band). That's part of the source image, not something the gallery
// draws — leave it visible. Filenames on the bucket follow
// sample_NN_<species>.jpg for easy debugging.
//
// Species mix (proportions requested for demo variety):
//   coyote    6   (05:19–01:37 · rare nocturnal visitor)
//   cat       1   (03-15 21:28 · a neighborhood stray)
//   tortoise  5   (03-12 to 07-01 · lives in the yard)
//   squirrel 10   (foraging alongside the tortoise most days)
//   deer     28   (dominant species — 82% of real WPS-1 captures)
//
// Public / private: 44 public, 6 private (the cat + 5 tortoises are tagged
// private on the theory that yard pets shouldn't hit the public gallery).

const BUCKET = "https://storage.googleapis.com/louielabs-camera-samples/wps1";

export const mockCameras = [
  { id: "wps_1", name: "WPS-1 (Backyard)" },
];

export const mockSpecies = [
  "deer", "squirrel", "coyote", "tortoise", "cat",
];

export const mockCaptures = [
  // ==========================================================================
  // COYOTE (6)
  // ==========================================================================
  {
    id: "cap_20260512_201655_wps_1",
    imageUrl: `${BUCKET}/sample_01_coyote.jpg`,
    timestamp: "2026-05-12T20:16:55Z",
    cameraId: "wps_1",
    species: "coyote",
    confidence: 0.92,
    temperatureF: 63,
    humidityPercent: 65,
    public: true,
    detections: [
      { label: "coyote", confidence: 0.92, bbox: { x: 260, y: 220, w: 140, h: 130 } },
    ],
  },
  {
    id: "cap_20260512_215907_wps_1",
    imageUrl: `${BUCKET}/sample_02_coyote.jpg`,
    timestamp: "2026-05-12T21:59:07Z",
    cameraId: "wps_1",
    species: "coyote",
    confidence: 0.84,
    temperatureF: 59,
    humidityPercent: 72,
    public: true,
    detections: [
      { label: "coyote", confidence: 0.84, bbox: { x: 340, y: 170, w: 100, h: 130 } },
    ],
  },
  {
    id: "cap_20260519_213743_wps_1",
    imageUrl: `${BUCKET}/sample_03_coyote.jpg`,
    timestamp: "2026-05-19T21:37:43Z",
    cameraId: "wps_1",
    species: "coyote",
    confidence: 0.89,
    temperatureF: 51,
    humidityPercent: 79,
    public: true,
    detections: [
      { label: "coyote", confidence: 0.89, bbox: { x: 170, y: 220, w: 150, h: 110 } },
    ],
  },
  {
    id: "cap_20260608_025326_wps_1",
    imageUrl: `${BUCKET}/sample_04_coyote.jpg`,
    timestamp: "2026-06-08T02:53:26Z",
    cameraId: "wps_1",
    species: "coyote",
    confidence: 0.87,
    temperatureF: 52,
    humidityPercent: 85,
    public: true,
    detections: [
      { label: "coyote", confidence: 0.87, bbox: { x: 240, y: 175, w: 130, h: 145 } },
    ],
  },
  {
    id: "cap_20260519_063022_wps_1",
    imageUrl: `${BUCKET}/sample_05_coyote.jpg`,
    timestamp: "2026-05-19T06:30:22Z",
    cameraId: "wps_1",
    species: "coyote",
    confidence: 0.94,
    temperatureF: 50,
    humidityPercent: 82,
    public: true,
    detections: [
      { label: "coyote", confidence: 0.94, bbox: { x: 170, y: 240, w: 200, h: 140 } },
    ],
  },
  {
    id: "cap_20260528_094815_wps_1",
    imageUrl: `${BUCKET}/sample_06_coyote.jpg`,
    timestamp: "2026-05-28T09:48:15Z",
    cameraId: "wps_1",
    species: "coyote",
    confidence: 0.90,
    temperatureF: 55,
    humidityPercent: 70,
    public: true,
    detections: [
      { label: "coyote", confidence: 0.90, bbox: { x: 260, y: 245, w: 140, h: 90 } },
    ],
  },

  // ==========================================================================
  // CAT (1) — private (assumed neighborhood pet)
  // ==========================================================================
  {
    id: "cap_20260315_212812_wps_1",
    imageUrl: `${BUCKET}/sample_07_cat.jpg`,
    timestamp: "2026-03-15T21:28:12Z",
    cameraId: "wps_1",
    species: "cat",
    confidence: 0.75,
    temperatureF: 48,
    humidityPercent: 84,
    public: false,
    detections: [
      { label: "cat", confidence: 0.75, bbox: { x: 200, y: 220, w: 180, h: 110 } },
    ],
  },

  // ==========================================================================
  // TORTOISE (5) — all private (yard pet)
  // ==========================================================================
  {
    id: "cap_20260317_053823_wps_1",
    imageUrl: `${BUCKET}/sample_08_tortoise.jpg`,
    timestamp: "2026-03-17T05:38:23Z",
    cameraId: "wps_1",
    species: "tortoise",
    confidence: 0.88,
    temperatureF: 54,
    humidityPercent: 84,
    public: false,
    detections: [
      { label: "tortoise", confidence: 0.88, bbox: { x: 370, y: 135, w: 120, h: 70 } },
    ],
  },
  {
    id: "cap_20260316_065509_wps_1",
    imageUrl: `${BUCKET}/sample_09_tortoise.jpg`,
    timestamp: "2026-03-16T06:55:09Z",
    cameraId: "wps_1",
    species: "tortoise",
    confidence: 0.91,
    temperatureF: 56,
    humidityPercent: 80,
    public: false,
    detections: [
      { label: "tortoise", confidence: 0.91, bbox: { x: 350, y: 130, w: 130, h: 75 } },
    ],
  },
  {
    id: "cap_20260319_083145_wps_1",
    imageUrl: `${BUCKET}/sample_10_tortoise.jpg`,
    timestamp: "2026-03-19T08:31:45Z",
    cameraId: "wps_1",
    species: "tortoise",
    confidence: 0.87,
    temperatureF: 58,
    humidityPercent: 74,
    public: false,
    detections: [
      { label: "tortoise", confidence: 0.87, bbox: { x: 340, y: 120, w: 110, h: 65 } },
    ],
  },
  {
    id: "cap_20260320_101132_wps_1",
    imageUrl: `${BUCKET}/sample_11_tortoise.jpg`,
    timestamp: "2026-03-20T10:11:32Z",
    cameraId: "wps_1",
    species: "tortoise",
    confidence: 0.90,
    temperatureF: 62,
    humidityPercent: 65,
    public: false,
    detections: [
      { label: "tortoise", confidence: 0.90, bbox: { x: 320, y: 130, w: 120, h: 70 } },
      { label: "squirrel", confidence: 0.68, bbox: { x: 470, y: 260, w: 70, h: 50 } },
    ],
  },
  {
    id: "cap_20260701_040822_wps_1",
    imageUrl: `${BUCKET}/sample_12_tortoise.jpg`,
    timestamp: "2026-07-01T04:08:22Z",
    cameraId: "wps_1",
    species: "tortoise",
    confidence: 0.85,
    temperatureF: 66,
    humidityPercent: 60,
    public: false,
    detections: [
      { label: "tortoise", confidence: 0.85, bbox: { x: 240, y: 180, w: 120, h: 65 } },
    ],
  },

  // ==========================================================================
  // SQUIRREL (10) — tortoise often co-appears in the frame
  // ==========================================================================
  {
    id: "cap_20260315_082951_wps_1",
    imageUrl: `${BUCKET}/sample_13_squirrel.jpg`,
    timestamp: "2026-03-15T08:29:51Z",
    cameraId: "wps_1",
    species: "squirrel",
    confidence: 0.78,
    temperatureF: 57,
    humidityPercent: 76,
    public: true,
    detections: [
      { label: "squirrel", confidence: 0.78, bbox: { x: 260, y: 260, w: 55, h: 55 } },
      { label: "tortoise", confidence: 0.82, bbox: { x: 320, y: 100, w: 130, h: 70 } },
    ],
  },
  {
    id: "cap_20260323_002059_wps_1",
    imageUrl: `${BUCKET}/sample_14_squirrel.jpg`,
    timestamp: "2026-03-23T00:20:59Z",
    cameraId: "wps_1",
    species: "squirrel",
    confidence: 0.72,
    temperatureF: 54,
    humidityPercent: 88,
    public: true,
    detections: [
      { label: "squirrel", confidence: 0.72, bbox: { x: 480, y: 300, w: 90, h: 60 } },
      { label: "tortoise", confidence: 0.86, bbox: { x: 240, y: 135, w: 140, h: 75 } },
    ],
  },
  {
    id: "cap_20260312_021654_wps_1",
    imageUrl: `${BUCKET}/sample_15_squirrel.jpg`,
    timestamp: "2026-03-12T02:16:54Z",
    cameraId: "wps_1",
    species: "squirrel",
    confidence: 0.74,
    temperatureF: 61,
    humidityPercent: 76,
    public: true,
    detections: [
      { label: "squirrel", confidence: 0.74, bbox: { x: 30, y: 265, w: 90, h: 70 } },
      { label: "tortoise", confidence: 0.89, bbox: { x: 300, y: 155, w: 120, h: 70 } },
    ],
  },
  {
    id: "cap_20260318_033107_wps_1",
    imageUrl: `${BUCKET}/sample_16_squirrel.jpg`,
    timestamp: "2026-03-18T03:31:07Z",
    cameraId: "wps_1",
    species: "squirrel",
    confidence: 0.70,
    temperatureF: 79,
    humidityPercent: 48,
    public: true,
    detections: [
      { label: "squirrel", confidence: 0.70, bbox: { x: 450, y: 340, w: 80, h: 55 } },
      { label: "tortoise", confidence: 0.83, bbox: { x: 300, y: 140, w: 130, h: 70 } },
    ],
  },
  {
    id: "cap_20260323_071024_wps_1",
    imageUrl: `${BUCKET}/sample_17_squirrel.jpg`,
    timestamp: "2026-03-23T07:10:24Z",
    cameraId: "wps_1",
    species: "squirrel",
    confidence: 0.71,
    temperatureF: 82,
    humidityPercent: 48,
    public: true,
    detections: [
      { label: "squirrel", confidence: 0.71, bbox: { x: 285, y: 260, w: 90, h: 60 } },
      { label: "tortoise", confidence: 0.85, bbox: { x: 300, y: 130, w: 140, h: 75 } },
    ],
  },
  {
    id: "cap_20260321_093903_wps_1",
    imageUrl: `${BUCKET}/sample_18_squirrel.jpg`,
    timestamp: "2026-03-21T09:39:03Z",
    cameraId: "wps_1",
    species: "squirrel",
    confidence: 0.79,
    temperatureF: 79,
    humidityPercent: 50,
    public: true,
    detections: [
      { label: "squirrel", confidence: 0.79, bbox: { x: 430, y: 265, w: 90, h: 65 } },
      { label: "tortoise", confidence: 0.87, bbox: { x: 310, y: 130, w: 130, h: 70 } },
    ],
  },
  {
    id: "cap_20260324_023650_wps_1",
    imageUrl: `${BUCKET}/sample_19_squirrel.jpg`,
    timestamp: "2026-03-24T02:36:50Z",
    cameraId: "wps_1",
    species: "squirrel",
    confidence: 0.76,
    temperatureF: 70,
    humidityPercent: 60,
    public: true,
    detections: [
      { label: "squirrel", confidence: 0.76, bbox: { x: 130, y: 265, w: 100, h: 60 } },
      { label: "tortoise", confidence: 0.85, bbox: { x: 340, y: 140, w: 130, h: 75 } },
    ],
  },
  {
    id: "cap_20260312_010703_wps_1",
    imageUrl: `${BUCKET}/sample_20_squirrel.jpg`,
    timestamp: "2026-03-12T01:07:03Z",
    cameraId: "wps_1",
    species: "squirrel",
    confidence: 0.73,
    temperatureF: 54,
    humidityPercent: 84,
    public: true,
    detections: [
      { label: "squirrel", confidence: 0.73, bbox: { x: 490, y: 240, w: 80, h: 55 } },
      { label: "tortoise", confidence: 0.83, bbox: { x: 290, y: 150, w: 130, h: 70 } },
    ],
  },
  {
    id: "cap_20260315_060123_wps_1",
    imageUrl: `${BUCKET}/sample_21_squirrel.jpg`,
    timestamp: "2026-03-15T06:01:23Z",
    cameraId: "wps_1",
    species: "squirrel",
    confidence: 0.75,
    temperatureF: 72,
    humidityPercent: 60,
    public: true,
    detections: [
      { label: "squirrel", confidence: 0.75, bbox: { x: 530, y: 350, w: 70, h: 55 } },
      { label: "tortoise", confidence: 0.81, bbox: { x: 250, y: 165, w: 140, h: 75 } },
    ],
  },
  {
    id: "cap_20260315_005646_wps_1",
    imageUrl: `${BUCKET}/sample_22_squirrel.jpg`,
    timestamp: "2026-03-15T00:56:46Z",
    cameraId: "wps_1",
    species: "squirrel",
    confidence: 0.70,
    temperatureF: 54,
    humidityPercent: 88,
    public: true,
    detections: [
      { label: "squirrel", confidence: 0.70, bbox: { x: 445, y: 280, w: 100, h: 60 } },
      { label: "tortoise", confidence: 0.79, bbox: { x: 265, y: 155, w: 135, h: 65 } },
    ],
  },

  // ==========================================================================
  // DEER (28) — the dominant species at this location
  // ==========================================================================
  {
    id: "cap_20260407_115910_wps_1",
    imageUrl: `${BUCKET}/sample_23_deer.jpg`,
    timestamp: "2026-04-07T11:59:10Z",
    cameraId: "wps_1",
    species: "deer",
    confidence: 0.94,
    temperatureF: 63,
    humidityPercent: 65,
    public: true,
    detections: [
      { label: "deer", confidence: 0.94, bbox: { x: 0, y: 30, w: 250, h: 350 } },
    ],
  },
  {
    id: "cap_20260507_151227_wps_1",
    imageUrl: `${BUCKET}/sample_24_deer.jpg`,
    timestamp: "2026-05-07T15:12:27Z",
    cameraId: "wps_1",
    species: "deer",
    confidence: 0.93,
    temperatureF: 70,
    humidityPercent: 58,
    public: true,
    detections: [
      { label: "deer", confidence: 0.93, bbox: { x: 435, y: 145, w: 205, h: 285 } },
    ],
  },
  {
    id: "cap_20260516_171949_wps_1",
    imageUrl: `${BUCKET}/sample_25_deer.jpg`,
    timestamp: "2026-05-16T17:19:49Z",
    cameraId: "wps_1",
    species: "deer",
    confidence: 0.92,
    temperatureF: 72,
    humidityPercent: 63,
    public: true,
    detections: [
      { label: "deer", confidence: 0.92, bbox: { x: 385, y: 180, w: 175, h: 175 } },
    ],
  },
  {
    id: "cap_20260521_180804_wps_1",
    imageUrl: `${BUCKET}/sample_26_deer.jpg`,
    timestamp: "2026-05-21T18:08:04Z",
    cameraId: "wps_1",
    species: "deer",
    confidence: 0.90,
    temperatureF: 73,
    humidityPercent: 65,
    public: true,
    detections: [
      { label: "deer", confidence: 0.90, bbox: { x: 20, y: 175, w: 190, h: 235 } },
    ],
  },
  {
    id: "cap_20260524_150528_wps_1",
    imageUrl: `${BUCKET}/sample_27_deer.jpg`,
    timestamp: "2026-05-24T15:05:28Z",
    cameraId: "wps_1",
    species: "deer",
    confidence: 0.86,
    temperatureF: 73,
    humidityPercent: 60,
    public: false,
    detections: [
      { label: "deer", confidence: 0.86, bbox: { x: 475, y: 195, w: 165, h: 240 } },
    ],
  },
  {
    id: "cap_20260531_195830_wps_1",
    imageUrl: `${BUCKET}/sample_28_deer.jpg`,
    timestamp: "2026-05-31T19:58:30Z",
    cameraId: "wps_1",
    species: "deer",
    confidence: 0.79,
    temperatureF: 57,
    humidityPercent: 76,
    public: true,
    detections: [
      { label: "deer", confidence: 0.79, bbox: { x: 0, y: 165, w: 55, h: 235 } },
    ],
  },
  {
    id: "cap_20260604_070218_wps_1",
    imageUrl: `${BUCKET}/sample_29_deer.jpg`,
    timestamp: "2026-06-04T07:02:18Z",
    cameraId: "wps_1",
    species: "deer",
    confidence: 0.91,
    temperatureF: 77,
    humidityPercent: 55,
    public: true,
    detections: [
      { label: "deer", confidence: 0.91, bbox: { x: 490, y: 200, w: 150, h: 235 } },
    ],
  },
  {
    id: "cap_20260612_143055_wps_1",
    imageUrl: `${BUCKET}/sample_30_deer.jpg`,
    timestamp: "2026-06-12T14:30:55Z",
    cameraId: "wps_1",
    species: "deer",
    confidence: 0.88,
    temperatureF: 81,
    humidityPercent: 50,
    public: true,
    detections: [
      { label: "deer", confidence: 0.88, bbox: { x: 235, y: 190, w: 155, h: 200 } },
    ],
  },
  {
    id: "cap_20260622_083218_wps_1",
    imageUrl: `${BUCKET}/sample_31_deer.jpg`,
    timestamp: "2026-06-22T08:32:18Z",
    cameraId: "wps_1",
    species: "deer",
    confidence: 0.85,
    temperatureF: 63,
    humidityPercent: 62,
    public: true,
    detections: [
      { label: "deer", confidence: 0.85, bbox: { x: 335, y: 185, w: 205, h: 235 } },
    ],
  },
  {
    id: "cap_20260623_114443_wps_1",
    imageUrl: `${BUCKET}/sample_32_deer.jpg`,
    timestamp: "2026-06-23T11:44:43Z",
    cameraId: "wps_1",
    species: "deer",
    confidence: 0.87,
    temperatureF: 70,
    humidityPercent: 58,
    public: true,
    detections: [
      { label: "deer", confidence: 0.87, bbox: { x: 285, y: 145, w: 250, h: 245 } },
    ],
  },
  {
    id: "cap_20260516_132808_wps_1",
    imageUrl: `${BUCKET}/sample_33_deer.jpg`,
    timestamp: "2026-05-16T13:28:08Z",
    cameraId: "wps_1",
    species: "deer",
    confidence: 0.94,
    temperatureF: 72,
    humidityPercent: 58,
    public: true,
    detections: [
      { label: "deer", confidence: 0.94, bbox: { x: 0, y: 175, w: 165, h: 205 } },
    ],
  },
  {
    id: "cap_20260521_155017_wps_1",
    imageUrl: `${BUCKET}/sample_34_deer.jpg`,
    timestamp: "2026-05-21T15:50:17Z",
    cameraId: "wps_1",
    species: "deer",
    confidence: 0.90,
    temperatureF: 79,
    humidityPercent: 52,
    public: true,
    detections: [
      { label: "deer", confidence: 0.90, bbox: { x: 435, y: 195, w: 195, h: 210 } },
    ],
  },
  {
    id: "cap_20260602_133202_wps_1",
    imageUrl: `${BUCKET}/sample_35_deer.jpg`,
    timestamp: "2026-06-02T13:32:02Z",
    cameraId: "wps_1",
    species: "deer",
    confidence: 0.88,
    temperatureF: 72,
    humidityPercent: 58,
    public: true,
    detections: [
      { label: "deer", confidence: 0.88, bbox: { x: 355, y: 165, w: 200, h: 185 } },
      { label: "deer", confidence: 0.75, bbox: { x: 390, y: 245, w: 100, h: 105 } },
    ],
  },
  {
    id: "cap_20260605_051052_wps_1",
    imageUrl: `${BUCKET}/sample_36_deer.jpg`,
    timestamp: "2026-06-05T05:10:52Z",
    cameraId: "wps_1",
    species: "deer",
    confidence: 0.89,
    temperatureF: 77,
    humidityPercent: 55,
    public: true,
    detections: [
      { label: "deer", confidence: 0.89, bbox: { x: 475, y: 195, w: 165, h: 245 } },
    ],
  },
  {
    id: "cap_20260609_172345_wps_1",
    imageUrl: `${BUCKET}/sample_37_deer.jpg`,
    timestamp: "2026-06-09T17:23:45Z",
    cameraId: "wps_1",
    species: "deer",
    confidence: 0.86,
    temperatureF: 66,
    humidityPercent: 62,
    public: true,
    detections: [
      { label: "deer", confidence: 0.86, bbox: { x: 0, y: 190, w: 245, h: 220 } },
    ],
  },
  {
    id: "cap_20260622_124355_wps_1",
    imageUrl: `${BUCKET}/sample_38_deer.jpg`,
    timestamp: "2026-06-22T12:43:55Z",
    cameraId: "wps_1",
    species: "deer",
    confidence: 0.83,
    temperatureF: 70,
    humidityPercent: 62,
    public: true,
    detections: [
      { label: "deer", confidence: 0.83, bbox: { x: 305, y: 180, w: 315, h: 250 } },
    ],
  },
  {
    id: "cap_20260625_193553_wps_1",
    imageUrl: `${BUCKET}/sample_39_deer.jpg`,
    timestamp: "2026-06-25T19:35:53Z",
    cameraId: "wps_1",
    species: "deer",
    confidence: 0.87,
    temperatureF: 61,
    humidityPercent: 74,
    public: false,
    detections: [
      { label: "deer", confidence: 0.87, bbox: { x: 5, y: 145, w: 165, h: 245 } },
    ],
  },
  {
    id: "cap_20260625_043553_wps_1",
    imageUrl: `${BUCKET}/sample_40_deer.jpg`,
    timestamp: "2026-06-25T04:35:53Z",
    cameraId: "wps_1",
    species: "deer",
    confidence: 0.83,
    temperatureF: 55,
    humidityPercent: 82,
    public: true,
    detections: [
      { label: "deer", confidence: 0.83, bbox: { x: 460, y: 145, w: 180, h: 265 } },
    ],
  },
  {
    id: "cap_20260626_032805_wps_1",
    imageUrl: `${BUCKET}/sample_41_deer.jpg`,
    timestamp: "2026-06-26T03:28:05Z",
    cameraId: "wps_1",
    species: "deer",
    confidence: 0.85,
    temperatureF: 54,
    humidityPercent: 90,
    public: true,
    detections: [
      { label: "deer", confidence: 0.85, bbox: { x: 355, y: 165, w: 280, h: 265 } },
    ],
  },
  {
    id: "cap_20260517_190329_wps_1",
    imageUrl: `${BUCKET}/sample_42_deer.jpg`,
    timestamp: "2026-05-17T19:03:29Z",
    cameraId: "wps_1",
    species: "deer",
    confidence: 0.83,
    temperatureF: 72,
    humidityPercent: 62,
    public: true,
    detections: [
      { label: "deer", confidence: 0.83, bbox: { x: 425, y: 220, w: 155, h: 210 } },
    ],
  },
  {
    id: "cap_20260519_184955_wps_1",
    imageUrl: `${BUCKET}/sample_43_deer.jpg`,
    timestamp: "2026-05-19T18:49:55Z",
    cameraId: "wps_1",
    species: "deer",
    confidence: 0.87,
    temperatureF: 79,
    humidityPercent: 52,
    public: false,
    detections: [
      { label: "deer", confidence: 0.87, bbox: { x: 425, y: 240, w: 195, h: 195 } },
    ],
  },
  {
    id: "cap_20260609_191914_wps_1",
    imageUrl: `${BUCKET}/sample_44_deer.jpg`,
    timestamp: "2026-06-09T19:19:14Z",
    cameraId: "wps_1",
    species: "deer",
    confidence: 0.84,
    temperatureF: 66,
    humidityPercent: 65,
    public: true,
    detections: [
      { label: "deer", confidence: 0.84, bbox: { x: 20, y: 220, w: 205, h: 220 } },
      { label: "deer", confidence: 0.70, bbox: { x: 55, y: 280, w: 90, h: 140 } },
    ],
  },
  {
    id: "cap_20260611_191913_wps_1",
    imageUrl: `${BUCKET}/sample_45_deer.jpg`,
    timestamp: "2026-06-11T19:19:13Z",
    cameraId: "wps_1",
    species: "deer",
    confidence: 0.89,
    temperatureF: 81,
    humidityPercent: 50,
    public: false,
    detections: [
      { label: "deer", confidence: 0.89, bbox: { x: 30, y: 205, w: 235, h: 235 } },
      { label: "deer", confidence: 0.68, bbox: { x: 5, y: 265, w: 80, h: 180 } },
    ],
  },
  {
    id: "cap_20260613_102701_wps_1",
    imageUrl: `${BUCKET}/sample_46_deer.jpg`,
    timestamp: "2026-06-13T10:27:01Z",
    cameraId: "wps_1",
    species: "deer",
    confidence: 0.86,
    temperatureF: 72,
    humidityPercent: 62,
    public: true,
    detections: [
      { label: "deer", confidence: 0.86, bbox: { x: 55, y: 220, w: 170, h: 195 } },
      { label: "deer", confidence: 0.72, bbox: { x: 0, y: 265, w: 80, h: 160 } },
    ],
  },
  {
    id: "cap_20260523_134035_wps_1",
    imageUrl: `${BUCKET}/sample_47_deer.jpg`,
    timestamp: "2026-05-23T13:40:35Z",
    cameraId: "wps_1",
    species: "deer",
    confidence: 0.85,
    temperatureF: 68,
    humidityPercent: 60,
    public: true,
    detections: [
      { label: "deer", confidence: 0.85, bbox: { x: 405, y: 175, w: 205, h: 240 } },
    ],
  },
  {
    id: "cap_20260528_191906_wps_1",
    imageUrl: `${BUCKET}/sample_48_deer.jpg`,
    timestamp: "2026-05-28T19:19:06Z",
    cameraId: "wps_1",
    species: "deer",
    confidence: 0.82,
    temperatureF: 72,
    humidityPercent: 62,
    public: false,
    detections: [
      { label: "deer", confidence: 0.82, bbox: { x: 415, y: 235, w: 170, h: 200 } },
    ],
  },
  {
    id: "cap_20260531_194546_wps_1",
    imageUrl: `${BUCKET}/sample_49_deer.jpg`,
    timestamp: "2026-05-31T19:45:46Z",
    cameraId: "wps_1",
    species: "deer",
    confidence: 0.80,
    temperatureF: 61,
    humidityPercent: 72,
    public: true,
    detections: [
      { label: "deer", confidence: 0.80, bbox: { x: 30, y: 200, w: 100, h: 210 } },
    ],
  },
  {
    id: "cap_20260618_180505_wps_1",
    imageUrl: `${BUCKET}/sample_50_deer.jpg`,
    timestamp: "2026-06-18T18:05:05Z",
    cameraId: "wps_1",
    species: "deer",
    confidence: 0.90,
    temperatureF: 77,
    humidityPercent: 55,
    public: false,
    detections: [
      { label: "deer", confidence: 0.90, bbox: { x: 340, y: 175, w: 300, h: 260 } },
    ],
  },
];

export default mockCaptures;
