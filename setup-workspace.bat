@echo off
echo ========================================================
echo  Sync LeetCode City to C:\leetcode City
echo ========================================================
echo.
echo Granting write permission to C:\leetcode City...
icacls "C:\leetcode City" /grant "%USERNAME%":(OI)(CI)F /T
echo.
echo Copying project files...
xcopy /E /I /Y "C:\Users\sriva\leetcode-city\*" "C:\leetcode City\"
echo.
echo Done! Project files successfully synced to C:\leetcode City.
pause
