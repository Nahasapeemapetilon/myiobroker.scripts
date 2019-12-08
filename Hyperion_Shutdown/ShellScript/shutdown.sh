#!/bin/sh
hyperion-remote --effect 'System Shutdown'
sleep 15 && /sbin/shutdown -h now