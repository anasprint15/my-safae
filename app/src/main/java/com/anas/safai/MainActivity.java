package com.anas.safai;

import android.Manifest;
import android.app.*;
import android.content.*;
import android.content.pm.PackageManager;
import android.os.*;
import android.webkit.*;
import android.graphics.Color;
import org.json.JSONObject;

public class MainActivity extends Activity {
    WebView web;
    static final int NOTIF_REQ = 77;
    @Override public void onCreate(Bundle b){ super.onCreate(b);
        web=new WebView(this); setContentView(web);
        WebSettings s=web.getSettings(); s.setJavaScriptEnabled(true); s.setDomStorageEnabled(true); s.setAllowFileAccess(true);
        web.setBackgroundColor(Color.TRANSPARENT);
        web.addJavascriptInterface(new AndroidBridge(this), "AndroidApp");
        web.setWebViewClient(new WebViewClient());
        web.loadUrl("file:///android_asset/index.html");
        if(Build.VERSION.SDK_INT>=33 && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)!=PackageManager.PERMISSION_GRANTED)
            requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS},NOTIF_REQ);
    }
    @Override public void onBackPressed(){ if(web.canGoBack()) web.goBack(); else super.onBackPressed(); }
}

class AndroidBridge {
    Context c; AndroidBridge(Context c){this.c=c;}
    @JavascriptInterface public void requestNotifications(){
        if(Build.VERSION.SDK_INT>=33 && c.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)!=PackageManager.PERMISSION_GRANTED)
            ((Activity)c).requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS},MainActivity.NOTIF_REQ);
    }
    @JavascriptInterface public void schedule(String title,String body,String isoMillis){
        try{
            long when=Long.parseLong(isoMillis); Intent i=new Intent(c,ReminderReceiver.class);
            i.putExtra("title",title); i.putExtra("body",body);
            int id=(int)(when ^ (when>>>32));
            PendingIntent pi=PendingIntent.getBroadcast(c,id,i,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
            AlarmManager am=(AlarmManager)c.getSystemService(Context.ALARM_SERVICE);
            if(am!=null){ if(Build.VERSION.SDK_INT>=23) am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,when,pi); else am.setExact(AlarmManager.RTC_WAKEUP,when,pi); }
        }catch(Exception ignored){}
    }
}
