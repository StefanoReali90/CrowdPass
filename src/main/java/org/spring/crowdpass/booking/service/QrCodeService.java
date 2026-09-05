package org.spring.crowdpass.booking.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;

@Service
public class QrCodeService {

    private static final int WIDTH = 300;
    private static final int HEIGHT = 300;

    public String createQrCode(String text) {
        byte[] pngBytes = createQrCodeBytes(text);
        String base64Image = Base64.getEncoder().encodeToString(pngBytes);
        return "data:image/png;base64," + base64Image;
    }

    public byte[] createQrCodeBytes(String text) {
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, WIDTH, HEIGHT);
            ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "png", byteArrayOutputStream);
            return byteArrayOutputStream.toByteArray();
        } catch (WriterException | IOException e) {
            throw new RuntimeException(e);

        }
    }
}
