---
title: Linux并行解压缩命令pigz
categories:
  - 操作系统
  - Linux
tags:
  - Linux
copyright: true
abbrlink: 2025d7d5
date: 2020-11-24 18:02:08
---

Linux一切皆文件。解压缩文件是日常操作。一般都是用gzip来解压缩的，但是gzip是串行的。那就会造成解压缩速度比较慢。为了提高效率，那有没有可以并行解压缩的呢？这就是给大家推荐的`pigz`命令。



<!--more-->

## 简介

**效率**

pigz命令可以用来解压缩文件，最重要的是支持多线程并行处理，解压缩比gzip快。 pigz时间上比gzip快60%，同时CPU消耗则是gzip的好几倍。

**场景**

在对压缩效率要求较高、但对短时间内CPU消耗较高不受影响的场景，使用pigz非常合适。

**默认**

pigz 默认用当前的逻辑 cpu 个数来并发压缩，如果无法检测cpu逻辑个数的话，则默认并发 8 个线程，也可以使用 `-p` 指定线程数。需要注意的是其运行时 CPU使用比较高。



## 参考

[官方网站](http://zlib.net/pigz/)



## 安装

```bash
yum install pigz -y
```



## 语法

```bash
#pigz [参数] [文件]

pigz [ -cdfhikKlLmMnNqrRtz0..9,11 ] [ -b blocksize ] [ -p threads ] 
     [ -S suffix ] [ name ...  ]
unpigz [ -cfhikKlLmMnNqrRtz ] [ -b blocksize ] [ -p threads ] 
       [ -S suffix ] [ name ...  ]
```

## 参数

```bash
-0 to -9, -11       # Compression level (level 11, zopfli, is much slower)
--fast, --best      # Compression levels 1 and 9 respectively
-b, --blocksize mmm # Set compression block size to mmmK (default 128K)
-c, --stdout        # Write all processed output to stdout (won't delete)
-d, --decompress    # Decompress the compressed input
-f, --force         # Force overwrite, compress .gz, links, and to terminal
-F  --first         # Do iterations first, before block split for -11
-h, --help          # Display a help screen and quit
-i, --independent   # Compress blocks independently for damage recovery
-I, --iterations n  # Number of iterations for -11 optimization
-J, --maxsplits n   # Maximum number of split blocks for -11
-k, --keep          # Do not delete original file after processing
-K, --zip           # Compress to PKWare zip (.zip) single entry format
-l, --list          # List the contents of the compressed input
-L, --license       # Display the pigz license and quit
-m, --no-time       # Do not store or restore mod time
-M, --time          # Store or restore mod time
-n, --no-name       # Do not store or restore file name or mod time
-N, --name          # Store or restore file name and mod time
-O  --oneblock      # Do not split into smaller blocks for -11
-p, --processes n   # Allow up to n compression threads (default is the number of online processors, or 8 if unknown)
-q, --quiet         # Print no messages, even on error
-r, --recursive     # Process the contents of all subdirectories
-R, --rsyncable     # Input-determined block locations for rsync
-S, --suffix .sss   # Use suffix .sss instead of .gz (for compression)
-t, --test          # Test the integrity of the compressed input
-v, --verbose       # Provide more verbose output
-V  --version       # Show the version of pigz
-Y  --synchronous   # Force output file write to permanent storage
-z, --zlib          # Compress to zlib (.zz) instead of gzip format
--                  # All arguments after "--" are treated as files
```

**常用参数**

```bash
-0 to -9, -11 #压缩级别
-p n #指定压缩核心数，默认8个
-k #压缩/解压后保留原文件
```



## 实例

可以结合`tar`使用, 压缩命令

```bash
tar -cvf - dir1 dir2 dir3 | pigz -p 8 > output.tgz
```

解压命令

```bash
pigz -p 8 -d output.tgz
```

如果是gzip格式，也支持用tar解压

```bash
tar -xzvf output.tgz
```

## 扩展

除了`pigz`,`pbzip2`和`p7zip`分别是对bz2和7z格式进行并行化。