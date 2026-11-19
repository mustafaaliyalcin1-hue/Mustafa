package com.tepetaklak.studyo;

import android.Manifest;
import android.app.Activity;
import android.content.ContentValues;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.media.MediaScannerConnection;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.view.View;
import android.view.Window;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.Map;

/**
 * Tepetaklak Stüdyo — çevrimdışı video kurgu. Arayüz ve kurgu motoru (ffmpeg.wasm) assets/web içinde;
 * WebView bunları https://appassets.androidplatform.net/ adresinden yükler (internet gerekmez).
 */
public class MainActivity extends Activity {
    private static final String ALAN = "appassets.androidplatform.net";
    private static final int DOSYA_SEC = 1, IZIN = 2;
    private WebView web;
    private ValueCallback<Uri[]> dosyaCb;
    private OutputStream kayitAkis;
    private Uri kayitUri, sonUri;
    private File kayitDosya;

    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setStatusBarColor(0xFF0F1117);
        getWindow().setNavigationBarColor(0xFF0F1117);
        web = new WebView(this);
        web.setBackgroundColor(0xFF0F1117);
        setContentView(web);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(true);
        s.setCacheMode(WebSettings.LOAD_NO_CACHE);
        web.addJavascriptInterface(new Kopru(), "Android");

        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView v, WebResourceRequest r) {
                Uri u = r.getUrl();
                if (!ALAN.equals(u.getHost())) return null;
                String yol = u.getPath();
                if (yol == null || yol.equals("/")) yol = "/index.html";
                Map<String, String> h = new HashMap<>();
                h.put("Access-Control-Allow-Origin", "*");
                h.put("Cache-Control", "no-cache");
                try {
                    InputStream in = getAssets().open("web" + yol);
                    String mime = mime(yol);
                    boolean metin = mime.startsWith("text/") || mime.contains("javascript") || mime.contains("json");
                    return new WebResourceResponse(mime, metin ? "utf-8" : null, 200, "OK", h, in);
                } catch (IOException e) {
                    return new WebResourceResponse("text/plain", "utf-8", 404, "Not Found", h, null);
                }
            }

            @Override
            @SuppressWarnings("deprecation")
            public boolean shouldOverrideUrlLoading(WebView v, String url) {
                return !ALAN.equals(Uri.parse(url).getHost());  // dış bağlantı açılmaz
            }
        });

        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView w, ValueCallback<Uri[]> cb, FileChooserParams p) {
                if (dosyaCb != null) dosyaCb.onReceiveValue(null);
                dosyaCb = cb;
                Intent i = new Intent(Intent.ACTION_GET_CONTENT);
                i.addCategory(Intent.CATEGORY_OPENABLE);
                i.setType("video/*");
                try {
                    startActivityForResult(Intent.createChooser(i, "Video seç"), DOSYA_SEC);
                } catch (Exception e) {
                    dosyaCb = null;
                    return false;
                }
                return true;
            }
        });

        if (Build.VERSION.SDK_INT < 29 && checkSelfPermission(Manifest.permission.WRITE_EXTERNAL_STORAGE)
                != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{Manifest.permission.WRITE_EXTERNAL_STORAGE}, IZIN);
        }
        web.loadUrl("https://" + ALAN + "/index.html");
    }

    private static String mime(String yol) {
        String y = yol.toLowerCase();
        if (y.endsWith(".html")) return "text/html";
        if (y.endsWith(".js") || y.endsWith(".mjs")) return "text/javascript";
        if (y.endsWith(".css")) return "text/css";
        if (y.endsWith(".wasm")) return "application/wasm";
        if (y.endsWith(".json")) return "application/json";
        if (y.endsWith(".ttf")) return "font/ttf";
        if (y.endsWith(".mp3")) return "audio/mpeg";
        if (y.endsWith(".png")) return "image/png";
        if (y.endsWith(".svg")) return "image/svg+xml";
        return "application/octet-stream";
    }

    @Override
    protected void onActivityResult(int istek, int sonuc, Intent veri) {
        if (istek == DOSYA_SEC && dosyaCb != null) {
            Uri[] r = (sonuc == RESULT_OK && veri != null && veri.getData() != null) ? new Uri[]{veri.getData()} : null;
            dosyaCb.onReceiveValue(r);
            dosyaCb = null;
            return;
        }
        super.onActivityResult(istek, sonuc, veri);
    }

    @Override
    public void onBackPressed() {
        web.evaluateJavascript("(function(){var s=document.querySelector('#sonuc');if(s&&!s.classList.contains('gizli')){"
                + "document.querySelector('#yeniden').click();return 1}return 0})()", new ValueCallback<String>() {
            @Override
            public void onReceiveValue(String v) {
                if (!"1".equals(v)) MainActivity.super.onBackPressed();
            }
        });
    }

    /** JS köprüsü: kurgulanan videoyu Galeri'ye (Filmler/Tepetaklak Stüdyo) kaydet ve paylaş */
    private class Kopru {
        @JavascriptInterface
        public void kaydetBasla(String ad) {
            kapat();
            try {
                if (Build.VERSION.SDK_INT >= 29) {
                    ContentValues cv = new ContentValues();
                    cv.put(MediaStore.MediaColumns.DISPLAY_NAME, ad);
                    cv.put(MediaStore.MediaColumns.MIME_TYPE, "video/mp4");
                    cv.put("relative_path", Environment.DIRECTORY_MOVIES + "/Tepetaklak Stüdyo");
                    cv.put("is_pending", 1);
                    kayitUri = getContentResolver().insert(MediaStore.Video.Media.EXTERNAL_CONTENT_URI, cv);
                    kayitAkis = getContentResolver().openOutputStream(kayitUri);
                } else {
                    File d = new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_MOVIES), "Tepetaklak Stüdyo");
                    d.mkdirs();
                    kayitDosya = new File(d, ad);
                    kayitAkis = new FileOutputStream(kayitDosya);
                }
            } catch (Exception e) {
                kayitAkis = null;
            }
        }

        @JavascriptInterface
        public void kaydetParca(String b64) {
            if (kayitAkis == null) return;
            try {
                kayitAkis.write(Base64.decode(b64, Base64.DEFAULT));
            } catch (IOException e) {
                kapat();
            }
        }

        @JavascriptInterface
        public boolean kaydetBitir() {
            if (kayitAkis == null) return false;
            try {
                kayitAkis.close();
                kayitAkis = null;
                if (Build.VERSION.SDK_INT >= 29) {
                    ContentValues cv = new ContentValues();
                    cv.put("is_pending", 0);
                    getContentResolver().update(kayitUri, cv, null, null);
                    sonUri = kayitUri;
                } else {
                    MediaScannerConnection.scanFile(MainActivity.this, new String[]{kayitDosya.getAbsolutePath()},
                            new String[]{"video/mp4"}, new MediaScannerConnection.OnScanCompletedListener() {
                                @Override
                                public void onScanCompleted(String yol, Uri uri) { sonUri = uri; }
                            });
                }
                return true;
            } catch (IOException e) {
                return false;
            }
        }

        @JavascriptInterface
        public boolean sonKayitVar() {
            return sonUri != null;
        }

        @JavascriptInterface
        public void paylas() {
            if (sonUri == null) return;
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    Intent i = new Intent(Intent.ACTION_SEND);
                    i.setType("video/mp4");
                    i.putExtra(Intent.EXTRA_STREAM, sonUri);
                    i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    startActivity(Intent.createChooser(i, "Videoyu paylaş"));
                }
            });
        }
    }

    private void kapat() {
        if (kayitAkis != null) {
            try { kayitAkis.close(); } catch (IOException ignored) { }
            kayitAkis = null;
        }
    }

    @Override
    protected void onDestroy() {
        kapat();
        if (web != null) web.destroy();
        super.onDestroy();
    }
}
