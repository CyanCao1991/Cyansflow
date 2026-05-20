# 甲方PM工作流智能协作平台 - 文件复制脚本
# 将此脚本保存后在 PowerShell 中运行

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  甲方PM工作流智能协作平台" -ForegroundColor Cyan
Write-Host "  项目文件复制工具" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 目标目录
$targetDir = "D:\BPFlow"

# 检查当前目录
$sourceDir = Get-Location
Write-Host "当前目录: $sourceDir" -ForegroundColor Yellow

# 确认目标目录
Write-Host ""
$confirm = Read-Host "是否要将文件复制到 $targetDir ? (y/n)"

if ($confirm -ne 'y' -and $confirm -ne 'Y') {
    Write-Host "操作已取消。" -ForegroundColor Red
    exit
}

# 创建目标目录
if (!(Test-Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    Write-Host "已创建目录: $targetDir" -ForegroundColor Green
}

Write-Host ""
Write-Host "开始复制文件..." -ForegroundColor Yellow

# 需要复制的文件列表
$filesToCopy = @(
    "package.json",
    "package-lock.json",
    "tsconfig.json",
    "vite.config.ts",
    "tailwind.config.js",
    "postcss.config.js",
    "eslint.config.js",
    "index.html",
    ".gitignore",
    ".env.example",
    "README.md",
    "本地部署指南.md"
)

# 复制文件
foreach ($file in $filesToCopy) {
    if (Test-Path $file) {
        Copy-Item -Path $file -Destination "$targetDir\$file" -Force
        Write-Host "✓ 已复制: $file" -ForegroundColor Green
    } else {
        Write-Host "⚠  文件不存在: $file" -ForegroundColor Yellow
    }
}

# 需要复制的文件夹列表
$foldersToCopy = @(
    "src",
    "public",
    ".trae"
)

# 复制文件夹
foreach ($folder in $foldersToCopy) {
    if (Test-Path $folder) {
        if (Test-Path "$targetDir\$folder") {
            Remove-Item -Path "$targetDir\$folder" -Recurse -Force
        }
        Copy-Item -Path $folder -Destination $targetDir -Recurse -Force
        Write-Host "✓ 已复制文件夹: $folder" -ForegroundColor Green
    } else {
        Write-Host "⚠  文件夹不存在: $folder" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  文件复制完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "下一步操作:" -ForegroundColor Yellow
Write-Host "1. 打开命令行，进入目录: cd $targetDir" -ForegroundColor White
Write-Host "2. 安装依赖: npm install" -ForegroundColor White
Write-Host "3. 启动项目: npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "按任意键退出..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
