package com.anas.safai;

import android.app.*;import android.content.*;import android.os.Build;

public class ReminderReceiver extends BroadcastReceiver {
  @Override public void onReceive(Context c, Intent i){
    String title=i.getStringExtra("title"); String body=i.getStringExtra("body");
    String channel="safai_reminders";
    NotificationManager nm=(NotificationManager)c.getSystemService(Context.NOTIFICATION_SERVICE);
    if(Build.VERSION.SDK_INT>=26){ NotificationChannel ch=new NotificationChannel(channel,"صفائي - التذكيرات",NotificationManager.IMPORTANCE_HIGH); nm.createNotificationChannel(ch); }
    Intent open=new Intent(c,MainActivity.class); PendingIntent pi=PendingIntent.getActivity(c,0,open,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
    Notification.Builder b=Build.VERSION.SDK_INT>=26?new Notification.Builder(c,channel):new Notification.Builder(c);
    b.setSmallIcon(android.R.drawable.ic_popup_reminder).setContentTitle(title==null?"صفائي":title).setContentText(body==null?"لديك مهمة الآن":body).setAutoCancel(true).setContentIntent(pi).setPriority(Notification.PRIORITY_HIGH);
    nm.notify((int)System.currentTimeMillis(),b.build());
  }
}
