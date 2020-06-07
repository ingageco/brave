FROM ubuntu:20.04
ENV LANG en_US.utf8

EXPOSE 5000

COPY run.sh /root/run.sh

ENV SANIC_NO_UVLOOP true
ENV SANIC_NO_UJSON=true
ENV DEBIAN_FRONTEND="noninteractive"

WORKDIR /root/
RUN apt-get update && \
    apt-get install -y build-essential gir1.2-gst-plugins-bad-1.0 git gobject-introspection \
        gstreamer1.0-libav gstreamer1.0-nice gstreamer1.0-plugins-bad gstreamer1.0-plugins-base \
        gstreamer1.0-plugins-good gstreamer1.0-plugins-ugly gstreamer1.0-tools \
        libcairo2-dev libgirepository1.0-dev pkg-config python3-gst-1.0 \
        python3-dev python3-pip curl locales && \
    ln -fs /usr/share/zoneinfo/America/Berlin /etc/localtime && \
    dpkg-reconfigure --frontend noninteractive tzdata && \
    localedef -i en_US -c -f UTF-8 -A /usr/share/locale/locale.alias en_US.UTF-8 && \
    rm -rf /var/lib/apt/lists/* && \
    curl https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh --output ~/miniconda.sh && \
    bash ~/miniconda.sh -b -p /root/miniconda

COPY requirements.txt /root/requirements.txt

RUN eval "$(/root/miniconda/bin/conda shell.bash hook)" && conda init && conda create -n brave python=3.6 pip conda && \
  eval "$(/root/miniconda/bin/conda shell.bash hook)" && conda activate brave && git clone https://github.com/bbc/brave.git \
    && cd brave && /root/miniconda/bin/pip install -r /root/requirements.txt

CMD ["bash", "/root/run.sh"]
