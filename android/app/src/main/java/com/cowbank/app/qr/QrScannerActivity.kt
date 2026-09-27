package com.cowbank.app.qr

import android.Manifest
import android.animation.ValueAnimator
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.RectF
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.Size
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import android.widget.TextView
import androidx.activity.ComponentActivity
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.ImageProxy
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.google.mlkit.vision.barcode.BarcodeScanning
import com.google.mlkit.vision.barcode.BarcodeScanner
import com.google.mlkit.vision.barcode.BarcodeScannerOptions
import com.google.mlkit.vision.barcode.common.Barcode
import com.google.mlkit.vision.common.InputImage
import java.util.concurrent.Executors

class QrScannerActivity : ComponentActivity() {
  private val cameraExecutor = Executors.newSingleThreadExecutor()
  private val mainHandler = Handler(Looper.getMainLooper())
  private val barcodeScanner: BarcodeScanner = BarcodeScanning.getClient(
    BarcodeScannerOptions.Builder()
      .setBarcodeFormats(Barcode.FORMAT_QR_CODE)
      .build()
  )
  private var finished = false
  private var processingFrame = false
  private lateinit var scannerOverlay: ScannerOverlayView

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
      ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.CAMERA), CAMERA_PERMISSION_REQUEST)
      return
    }

    startCamera()
  }

  override fun onRequestPermissionsResult(
    requestCode: Int,
    permissions: Array<out String>,
    grantResults: IntArray
  ) {
    super.onRequestPermissionsResult(requestCode, permissions, grantResults)
    if (requestCode == CAMERA_PERMISSION_REQUEST && grantResults.firstOrNull() == PackageManager.PERMISSION_GRANTED) {
      startCamera()
    } else {
      setResult(Activity.RESULT_CANCELED)
      finish()
    }
  }

  private fun startCamera() {
    val previewView = PreviewView(this).apply {
      scaleType = PreviewView.ScaleType.FILL_CENTER
    }

    val root = FrameLayout(this)
    root.addView(
      previewView,
      FrameLayout.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.MATCH_PARENT
      )
    )
    root.addView(createTitle())
    scannerOverlay = ScannerOverlayView(this)
    root.addView(
      scannerOverlay,
      FrameLayout.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.MATCH_PARENT
      )
    )
    root.addView(createHint())
    root.addView(createCloseButton())
    setContentView(root)

    val cameraProviderFuture = ProcessCameraProvider.getInstance(this)
    cameraProviderFuture.addListener({
      val cameraProvider = cameraProviderFuture.get()
      val preview = Preview.Builder().build().also {
        it.setSurfaceProvider(previewView.surfaceProvider)
      }
      val analysis = ImageAnalysis.Builder()
        .setTargetResolution(Size(960, 540))
        .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
        .setOutputImageRotationEnabled(true)
        .build()
        .also {
          it.setAnalyzer(cameraExecutor, ::analyzeImage)
        }

      cameraProvider.unbindAll()
      cameraProvider.bindToLifecycle(
        this,
        CameraSelector.DEFAULT_BACK_CAMERA,
        preview,
        analysis
      )
    }, ContextCompat.getMainExecutor(this))
  }

  private fun analyzeImage(imageProxy: ImageProxy) {
    if (finished || processingFrame) {
      imageProxy.close()
      return
    }

    val mediaImage = imageProxy.image
    if (mediaImage == null) {
      imageProxy.close()
      return
    }

    processingFrame = true
    val image = InputImage.fromMediaImage(mediaImage, imageProxy.imageInfo.rotationDegrees)
    barcodeScanner.process(image)
      .addOnSuccessListener { barcodes ->
        val qrValue = barcodes.firstOrNull()?.rawValue
        if (!qrValue.isNullOrBlank()) {
          finishWithValue(qrValue)
        }
      }
      .addOnCompleteListener {
        processingFrame = false
        imageProxy.close()
      }
  }

  private fun finishWithValue(value: String) {
    if (finished) return
    finished = true
    mainHandler.post {
      scannerOverlay.showSuccess()
      scannerOverlay.announceForAccessibility("QR Code lido")
      mainHandler.postDelayed({
        val data = Intent().putExtra(EXTRA_QR_VALUE, value)
        setResult(Activity.RESULT_OK, data)
        finish()
      }, SUCCESS_ANIMATION_MS)
    }
  }

  private fun createTitle(): TextView {
    return TextView(this).apply {
      text = "Escanear QR Code"
      setTextColor(Color.WHITE)
      textSize = 26f
      typeface = android.graphics.Typeface.DEFAULT_BOLD
      setPadding(48, 80, 48, 24)
      layoutParams = FrameLayout.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.WRAP_CONTENT,
        Gravity.TOP
      )
    }
  }

  private fun createHint(): TextView {
    return TextView(this).apply {
      text = "Aponte a câmera para o QR Code do animal"
      setTextColor(Color.WHITE)
      textSize = 16f
      gravity = Gravity.CENTER
      setBackgroundColor(Color.argb(150, 0, 0, 0))
      setPadding(32, 24, 32, 24)
      layoutParams = FrameLayout.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.WRAP_CONTENT,
        Gravity.BOTTOM
      ).apply {
        setMargins(40, 0, 40, 70)
      }
    }
  }

  private fun createCloseButton(): TextView {
    return TextView(this).apply {
      text = "Fechar"
      setTextColor(Color.WHITE)
      textSize = 16f
      gravity = Gravity.CENTER
      setBackgroundColor(Color.argb(130, 0, 0, 0))
      setPadding(28, 16, 28, 16)
      setOnClickListener {
        setResult(Activity.RESULT_CANCELED)
        finish()
      }
      layoutParams = FrameLayout.LayoutParams(
        ViewGroup.LayoutParams.WRAP_CONTENT,
        ViewGroup.LayoutParams.WRAP_CONTENT,
        Gravity.TOP or Gravity.END
      ).apply {
        setMargins(0, 78, 38, 0)
      }
    }
  }

  override fun onDestroy() {
    super.onDestroy()
    barcodeScanner.close()
    cameraExecutor.shutdown()
  }

  companion object {
    const val EXTRA_QR_VALUE = "qr_value"
    private const val CAMERA_PERMISSION_REQUEST = 9301
    private const val SUCCESS_ANIMATION_MS = 520L
  }
}

private class ScannerOverlayView(context: android.content.Context) : View(context) {
  private val maskPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
    color = Color.argb(128, 0, 0, 0)
  }
  private val cornerPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
    color = GREEN
    strokeWidth = dp(5f)
    style = Paint.Style.STROKE
    strokeCap = Paint.Cap.ROUND
  }
  private val linePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
    color = Color.argb(220, 31, 191, 107)
    strokeWidth = dp(2f)
    style = Paint.Style.STROKE
  }
  private val successPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
    color = GREEN
    strokeWidth = dp(6f)
    style = Paint.Style.STROKE
    strokeCap = Paint.Cap.ROUND
    strokeJoin = Paint.Join.ROUND
  }
  private val frameRect = RectF()
  private var scanProgress = 0f
  private var successProgress = 0f
  private var success = false

  private val scanAnimator = ValueAnimator.ofFloat(0f, 1f).apply {
    duration = 1650L
    repeatCount = ValueAnimator.INFINITE
    repeatMode = ValueAnimator.REVERSE
    addUpdateListener {
      scanProgress = it.animatedValue as Float
      invalidate()
    }
  }

  init {
    setLayerType(LAYER_TYPE_SOFTWARE, null)
    scanAnimator.start()
  }

  override fun onDetachedFromWindow() {
    scanAnimator.cancel()
    super.onDetachedFromWindow()
  }

  override fun onDraw(canvas: Canvas) {
    super.onDraw(canvas)
    calculateFrame()

    canvas.drawRect(0f, 0f, width.toFloat(), frameRect.top, maskPaint)
    canvas.drawRect(0f, frameRect.bottom, width.toFloat(), height.toFloat(), maskPaint)
    canvas.drawRect(0f, frameRect.top, frameRect.left, frameRect.bottom, maskPaint)
    canvas.drawRect(frameRect.right, frameRect.top, width.toFloat(), frameRect.bottom, maskPaint)

    drawCorners(canvas)
    drawScanLine(canvas)

    if (success) {
      drawSuccess(canvas)
    }
  }

  fun showSuccess() {
    if (success) return
    success = true
    scanAnimator.cancel()
    ValueAnimator.ofFloat(0f, 1f).apply {
      duration = 420L
      addUpdateListener {
        successProgress = it.animatedValue as Float
        invalidate()
      }
      start()
    }
  }

  private fun calculateFrame() {
    val frameWidth = width * 0.76f
    val frameHeight = frameWidth
    val left = (width - frameWidth) / 2f
    val top = (height - frameHeight) / 2f - dp(22f)
    frameRect.set(left, top, left + frameWidth, top + frameHeight)
  }

  private fun drawCorners(canvas: Canvas) {
    val length = dp(52f)
    val radius = dp(24f)

    canvas.drawLine(frameRect.left + radius, frameRect.top, frameRect.left + length, frameRect.top, cornerPaint)
    canvas.drawLine(frameRect.left, frameRect.top + radius, frameRect.left, frameRect.top + length, cornerPaint)

    canvas.drawLine(frameRect.right - length, frameRect.top, frameRect.right - radius, frameRect.top, cornerPaint)
    canvas.drawLine(frameRect.right, frameRect.top + radius, frameRect.right, frameRect.top + length, cornerPaint)

    canvas.drawLine(frameRect.left + radius, frameRect.bottom, frameRect.left + length, frameRect.bottom, cornerPaint)
    canvas.drawLine(frameRect.left, frameRect.bottom - length, frameRect.left, frameRect.bottom - radius, cornerPaint)

    canvas.drawLine(frameRect.right - length, frameRect.bottom, frameRect.right - radius, frameRect.bottom, cornerPaint)
    canvas.drawLine(frameRect.right, frameRect.bottom - length, frameRect.right, frameRect.bottom - radius, cornerPaint)
  }

  private fun drawScanLine(canvas: Canvas) {
    if (success) return
    val inset = dp(28f)
    val y = frameRect.top + inset + (frameRect.height() - inset * 2f) * scanProgress
    linePaint.setShadowLayer(dp(10f), 0f, 0f, GREEN)
    canvas.drawLine(frameRect.left + inset, y, frameRect.right - inset, y, linePaint)
  }

  private fun drawSuccess(canvas: Canvas) {
    val pulseInset = dp(18f) * (1f - successProgress)
    successPaint.alpha = (90 + 165 * successProgress).toInt()
    canvas.drawRoundRect(
      RectF(
        frameRect.left - pulseInset,
        frameRect.top - pulseInset,
        frameRect.right + pulseInset,
        frameRect.bottom + pulseInset
      ),
      dp(26f),
      dp(26f),
      successPaint
    )

    val centerX = frameRect.centerX()
    val centerY = frameRect.centerY()
    val checkSize = dp(72f)
    val startX = centerX - checkSize * 0.44f
    val startY = centerY + checkSize * 0.02f
    val midX = centerX - checkSize * 0.12f
    val midY = centerY + checkSize * 0.32f
    val endX = centerX + checkSize * 0.48f
    val endY = centerY - checkSize * 0.34f

    if (successProgress < 0.5f) {
      val p = successProgress / 0.5f
      canvas.drawLine(startX, startY, startX + (midX - startX) * p, startY + (midY - startY) * p, successPaint)
    } else {
      canvas.drawLine(startX, startY, midX, midY, successPaint)
      val p = (successProgress - 0.5f) / 0.5f
      canvas.drawLine(midX, midY, midX + (endX - midX) * p, midY + (endY - midY) * p, successPaint)
    }
  }

  private fun dp(value: Float): Float = value * resources.displayMetrics.density

  companion object {
    private val GREEN = Color.rgb(31, 191, 107)
  }
}
