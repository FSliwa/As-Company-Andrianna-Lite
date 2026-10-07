// Maska postaci do warstwy „tekst za postacią” w hero (src/views/Home.jsx, HeroCutout).
// macOS 14+ (Vision, VNGenerateForegroundInstanceMaskRequest) – lokalnie, bez pobierania modeli.
// Użycie: swift scripts/wyciecie-postaci.swift public/graphics/studio-05.jpg /tmp/maska.png
// potem: python3 scripts/wyciecie-postaci.py public/graphics/studio-05.jpg /tmp/maska.png
// (zgodność z wycięciem Canvy – remove-background – IoU 0,993 przy 133 × 200 px, 7.10.2026)
import Foundation
import Vision
import CoreImage
import AppKit
let args = CommandLine.arguments
let input = URL(fileURLWithPath: args[1]), output = URL(fileURLWithPath: args[2])
guard let ci = CIImage(contentsOf: input) else { fatalError("brak obrazu") }
let handler = VNImageRequestHandler(ciImage: ci)
let req = VNGenerateForegroundInstanceMaskRequest()
try handler.perform([req])
guard let obs = req.results?.first else { fatalError("brak wyniku") }
let buf = try obs.generateScaledMaskForImage(forInstances: obs.allInstances, from: handler)
let mask = CIImage(cvPixelBuffer: buf)
let ctx = CIContext()
try ctx.writePNGRepresentation(of: mask, to: output, format: .L8, colorSpace: CGColorSpaceCreateDeviceGray())
print("instancje:", obs.allInstances.count, "rozmiar:", CVPixelBufferGetWidth(buf), "x", CVPixelBufferGetHeight(buf))
